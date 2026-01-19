import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                reviews: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                reviews: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product (admin only) - requires auth
router.post('/', requireAuth(), async (req, res) => {
    try {
        const { name, description, price, image, categoryId, stock } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                image,
                categoryId,
                stock: parseInt(stock),
            },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product - requires auth
router.put('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, categoryId, stock } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                image,
                categoryId,
                stock: parseInt(stock),
            },
        });

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product - requires auth
router.delete('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id },
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
