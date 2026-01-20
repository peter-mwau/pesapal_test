import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class PesapalService {
    constructor() {
        this.consumerKey = process.env.PESAPAL_CONSUMER_KEY;
        this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
        this.baseUrl = process.env.PESAPAL_ENV === 'production'
            ? 'https://pay.pesapal.com/v3'
            : 'https://cybqa.pesapal.com/pesapalv3';
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Authenticate with Pesapal and get access token
     */
    async authenticate() {
        try {
            // Return existing token if still valid
            if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.token;
            }

            const response = await axios.post(
                `${this.baseUrl}/api/Auth/RequestToken`,
                {
                    consumer_key: this.consumerKey,
                    consumer_secret: this.consumerSecret
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            this.token = response.data.token;
            // Set token expiry (usually valid for 5 minutes, refresh 30s before)
            this.tokenExpiry = new Date(Date.now() + 4.5 * 60 * 1000);

            return this.token;
        } catch (error) {
            console.error('Pesapal authentication error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Pesapal');
        }
    }

    /**
     * Register IPN URL with Pesapal
     */
    async registerIPN(ipnUrl, ipnType = 'GET') {
        try {
            const token = await this.authenticate();

            const response = await axios.post(
                `${this.baseUrl}/api/URLSetup/RegisterIPN`,
                {
                    url: ipnUrl,
                    ipn_notification_type: ipnType
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('IPN registration error:', error.response?.data || error.message);
            throw new Error('Failed to register IPN URL');
        }
    }

    /**
     * Submit order request to Pesapal
     */
    async submitOrderRequest(orderData) {
        try {
            const token = await this.authenticate();

            const pesapalOrder = {
                id: orderData.id,
                currency: orderData.currency || 'KES',
                amount: orderData.amount,
                description: orderData.description,
                callback_url: orderData.callback_url,
                notification_id: orderData.notification_id,
                billing_address: {
                    email_address: orderData.billing_address.email_address,
                    phone_number: orderData.billing_address.phone_number,
                    country_code: orderData.billing_address.country_code || 'KE',
                    first_name: orderData.billing_address.first_name,
                    middle_name: orderData.billing_address.middle_name || '',
                    last_name: orderData.billing_address.last_name,
                    line_1: orderData.billing_address.line_1 || '',
                    line_2: orderData.billing_address.line_2 || '',
                    city: orderData.billing_address.city || '',
                    state: orderData.billing_address.state || '',
                    postal_code: orderData.billing_address.postal_code || '',
                    zip_code: orderData.billing_address.zip_code || ''
                }
            };

            const response = await axios.post(
                `${this.baseUrl}/api/Transactions/SubmitOrderRequest`,
                pesapalOrder,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Submit order error:', error.response?.data || error.message);
            throw new Error('Failed to submit order to Pesapal');
        }
    }

    /**
     * Get transaction status from Pesapal
     */
    async getTransactionStatus(orderTrackingId) {
        try {
            const token = await this.authenticate();

            const response = await axios.get(
                `${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Get transaction status error:', error.response?.data || error.message);
            throw new Error('Failed to get transaction status');
        }
    }

    /**
     * Helper method to format order data for Pesapal
     */
    formatOrderData(order, user, callbackUrl, notificationId) {
        return {
            id: order.orderNumber,
            currency: 'KES', // Change based on your needs
            amount: order.totalAmount,
            description: `Order ${order.orderNumber}`,
            callback_url: callbackUrl,
            notification_id: notificationId,
            billing_address: {
                email_address: user.email,
                phone_number: user.phone || '',
                country_code: 'KE',
                first_name: user.firstName || '',
                middle_name: '',
                last_name: user.lastName || '',
                line_1: '',
                line_2: '',
                city: '',
                state: '',
                postal_code: '',
                zip_code: ''
            }
        };
    }
}

export default new PesapalService();
