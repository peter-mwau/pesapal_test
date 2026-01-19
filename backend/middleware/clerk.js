import express from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import dotenv from 'dotenv';

dotenv.config();

export const setupClerkMiddleware = (app) => {
    // Verify Clerk is configured
    if (!process.env.CLERK_SECRET_KEY) {
        console.warn('⚠️  CLERK_SECRET_KEY not found in environment variables. Clerk authentication will not work.');
    }

    // Clerk middleware - adds auth info to req.auth
    app.use(clerkMiddleware());

    // Optional: Protect all routes by requiring auth
    // Uncomment the line below to require authentication for all routes
    // app.use(requireAuth());
};

// Custom middleware to attach user info to request
export const attachUserInfo = (req, res, next) => {
    if (req.auth.userId) {
        req.user = {
            id: req.auth.userId,
            sessionId: req.auth.sessionId,
        };
    }
    next();
};
