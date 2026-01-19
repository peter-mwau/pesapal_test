import { Router } from 'express';
import { requireAuth } from '@clerk/express';

const router = Router();

// Protected user routes - require authentication
router.get('/', requireAuth(), (req, res) => {
    const userId = req.auth.userId;
    res.json({ message: 'User route', userId });
});

// Get current user info
router.get('/me', requireAuth(), (req, res) => {
    res.json({
        userId: req.auth.userId,
        sessionId: req.auth.sessionId,
    });
});

export default router;
