import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import middleware
import { setupClerkMiddleware } from './middleware/clerk.js';

// Import routes
import indexRoutes from './routes/index.js';
import userRoutes from './routes/users.js';
import productsRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Setup
// ============================================

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors());

// Morgan for logging
app.use(morgan('dev'));

// Clerk authentication middleware
setupClerkMiddleware(app);

// ============================================
// Routes
// ============================================

app.use('/', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// ============================================
// Error Handling
// ============================================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});