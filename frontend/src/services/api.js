const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:30000/api';

export const api = {
    // Products
    getProducts: async () => {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    getProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    // Auth
    getUserProfile: async (token) => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    },

    updateUserProfile: async (token, userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const text = await response.text();
        if (!response.ok) {
            let message = 'Failed to update user profile';
            try {
                const data = JSON.parse(text || '{}');
                if (data?.error) message = `${message}: ${data.error}`;
                if (data?.details) message = `${message} (${data.details})`;
            } catch (err) {
                // ignore JSON parse errors
            }
            throw new Error(message);
        }
        return text ? JSON.parse(text) : {};
    },

    getUserCart: async (token) => {
        const response = await fetch(`${API_BASE_URL}/auth/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch cart');
        return response.json();
    },
};
