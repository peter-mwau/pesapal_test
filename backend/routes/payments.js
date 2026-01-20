import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { PrismaClient } from '@prisma/client';
import pesapalService from '../services/pesapal.js';

const router = Router();
const prisma = new PrismaClient();

// IPN ID - Store this in your database or environment variable after registering
let IPN_ID = process.env.PESAPAL_IPN_ID || null;

/**
 * Register IPN URL (Run this once to get your IPN ID)
 * POST /api/payments/register-ipn
 */
router.post('/register-ipn', requireAuth(), async (req, res) => {
    try {
        const ipnUrl = `${process.env.BACKEND_URL}/api/payments/ipn`;
        const result = await pesapalService.registerIPN(ipnUrl, 'GET');

        IPN_ID = result.ipn_id;

        res.json({
            success: true,
            message: 'IPN registered successfully. Add this to your .env file:',
            ipn_id: result.ipn_id,
            url: result.url
        });
    } catch (error) {
        console.error('Register IPN error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create order and initiate Pesapal checkout
 * POST /api/payments/checkout
 */
router.post('/checkout', requireAuth(), async (req, res) => {
    try {
        const { cartItems, shippingAddress, billingAddress, phone } = req.body;
        const userId = req.auth.userId; // Clerk user ID

        // Validate request
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cartItems) {
            const product = await prisma.product.findUnique({
                where: { id: item.id }
            });

            if (!product) {
                return res.status(404).json({ error: `Product ${item.id} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${product.title}`
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create order in database
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                status: 'PENDING',
                totalAmount,
                shippingAddress: JSON.stringify(shippingAddress),
                billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
                items: {
                    create: orderItems
                },
                payment: {
                    create: {
                        amount: totalAmount,
                        status: 'PENDING',
                        paymentMethod: 'pesapal'
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        });

        // Prepare Pesapal order data
        const callbackUrl = `${process.env.FRONTEND_URL}/payment/callback`;
        const notificationId = IPN_ID || process.env.PESAPAL_IPN_ID;

        if (!notificationId) {
            return res.status(500).json({
                error: 'IPN ID not configured. Please register IPN first.'
            });
        }

        const pesapalOrderData = pesapalService.formatOrderData(
            order,
            {
                ...user,
                phone: phone || user.phone
            },
            callbackUrl,
            notificationId
        );

        // Submit order to Pesapal
        const pesapalResponse = await pesapalService.submitOrderRequest(pesapalOrderData);

        // Update payment with tracking ID
        await prisma.payment.update({
            where: { orderId: order.id },
            data: {
                transactionId: pesapalResponse.order_tracking_id
            }
        });

        // Clear user's cart
        await prisma.cartItem.deleteMany({
            where: { userId: user.id }
        });

        res.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount
            },
            pesapal: {
                order_tracking_id: pesapalResponse.order_tracking_id,
                merchant_reference: pesapalResponse.merchant_reference,
                redirect_url: pesapalResponse.redirect_url
            }
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * IPN callback endpoint (Pesapal sends payment notifications here)
 * GET /api/payments/ipn?OrderTrackingId=xxx&OrderMerchantReference=xxx
 */
router.get('/ipn', async (req, res) => {
    try {
        const { OrderTrackingId, OrderMerchantReference } = req.query;

        console.log('IPN received:', { OrderTrackingId, OrderMerchantReference });

        if (!OrderTrackingId) {
            return res.status(400).json({ error: 'Missing OrderTrackingId' });
        }

        // Get transaction status from Pesapal
        const transactionStatus = await pesapalService.getTransactionStatus(OrderTrackingId);

        console.log('Transaction status:', transactionStatus);

        // Find payment by transaction ID
        const payment = await prisma.payment.findUnique({
            where: { transactionId: OrderTrackingId },
            include: { order: true }
        });

        if (!payment) {
            console.error('Payment not found for transaction:', OrderTrackingId);
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Update payment and order status based on Pesapal response
        const statusMap = {
            '0': 'INVALID',
            '1': 'COMPLETED',
            '2': 'FAILED',
            '3': 'REVERSED'
        };

        const pesapalStatus = transactionStatus.payment_status_description;
        let paymentStatus = 'PENDING';
        let orderStatus = 'PENDING';

        if (pesapalStatus === 'Completed') {
            paymentStatus = 'COMPLETED';
            orderStatus = 'PROCESSING';
        } else if (pesapalStatus === 'Failed') {
            paymentStatus = 'FAILED';
            orderStatus = 'CANCELLED';
        }

        // Update payment
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: paymentStatus,
                errorMessage: transactionStatus.error ? transactionStatus.error.message : null
            }
        });

        // Update order
        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: orderStatus }
        });

        // If payment completed, reduce product stock
        if (paymentStatus === 'COMPLETED') {
            const orderItems = await prisma.orderItem.findMany({
                where: { orderId: payment.orderId },
                include: { product: true }
            });

            for (const item of orderItems) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('IPN error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get payment status
 * GET /api/payments/status/:orderTrackingId
 */
router.get('/status/:orderTrackingId', requireAuth(), async (req, res) => {
    try {
        const { orderTrackingId } = req.params;

        // Get from database
        const payment = await prisma.payment.findUnique({
            where: { transactionId: orderTrackingId },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Also get latest status from Pesapal
        const transactionStatus = await pesapalService.getTransactionStatus(orderTrackingId);

        res.json({
            payment,
            pesapalStatus: transactionStatus
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user's orders
 * GET /api/payments/orders
 */
router.get('/orders', requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
