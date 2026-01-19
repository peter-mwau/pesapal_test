import { Router } from 'express';

const router = Router();

// Sample route
router.get('/', (req, res) => {
    res.send('Hello, World!');
});

export default router;
