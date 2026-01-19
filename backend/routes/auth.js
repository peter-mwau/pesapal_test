import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get user profile - requires auth
router.get('/me', requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                cartItems: {
                    include: {
                        product: true,
                    },
                },
                orders: true,
                reviews: true,
                wishlist: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Create or update user profile - requires auth
router.post('/me', requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;
        console.log('📝 Syncing user:', { userId, body: req.body });

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { clerkId, email, firstName, lastName, profileImage, phone } = req.body;

        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (user) {
            // Update existing user
            user = await prisma.user.update({
                where: { clerkId: userId },
                data: {
                    email,
                    firstName,
                    lastName,
                    profileImage,
                    phone,
                },
            });
            console.log('✏️ Updated user:', user);
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email,
                    firstName,
                    lastName,
                    profileImage,
                    phone,
                },
            });
            console.log('✅ Created new user:', user);
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('❌ Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile', details: error.message });
    }
});

// Get user cart items - requires auth
router.get('/cart', requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                cartItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

export default router;
