# Pesapal Integration - Setup Guide

This project includes a complete Pesapal payment gateway integration for your e-commerce application.

## Features

- ✅ Pesapal API v3 integration
- ✅ OAuth 2.0 authentication with token caching
- ✅ Order creation and checkout flow
- ✅ IPN (Instant Payment Notification) handling
- ✅ Payment status tracking
- ✅ Multiple payment methods (M-Pesa, Cards, Bank Transfer)
- ✅ Order history page
- ✅ Secure payment processing

## Setup Instructions

### 1. Pesapal Account Setup

1. **For Testing (Sandbox)**:
   - Visit https://cybqa.pesapal.com/
   - Create a demo account
   - Navigate to Developer Settings

2. **For Production**:
   - Visit https://www.pesapal.com/
   - Register for a business account
   - Complete KYC verification
   - Navigate to Developer Settings

3. **Get Your Credentials**:
   - Consumer Key
   - Consumer Secret

### 2. Backend Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update your `.env` file with Pesapal credentials:

   ```env
   PESAPAL_CONSUMER_KEY="your_consumer_key"
   PESAPAL_CONSUMER_SECRET="your_consumer_secret"
   PESAPAL_ENV="sandbox"  # or "production"
   BACKEND_URL="http://localhost:3000"
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Register IPN URL** (One-time setup):

   Start your backend server, then make a POST request:

   ```bash
   # Using curl (requires authentication)
   curl -X POST http://localhost:3000/api/payments/register-ipn \
     -H "Content-Type: application/json"
   ```

   Or use Postman/Insomnia to call:
   - **Endpoint**: `POST http://localhost:3000/api/payments/register-ipn`
   - **Headers**: Include Clerk authentication token

   The response will include an `ipn_id`. Add this to your `.env`:

   ```env
   PESAPAL_IPN_ID="your_ipn_id_here"
   ```

### 3. Database Setup

The Pesapal integration uses the existing Prisma schema. Make sure your database is up to date:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 4. Frontend Configuration

The frontend is already configured to work with the backend. Just ensure your backend URL is correct in:

- `frontend/src/pages/Checkout.jsx`
- `frontend/src/pages/PaymentCallback.jsx`
- `frontend/src/pages/Orders.jsx`

All are set to `http://localhost:3000` by default.

## How It Works

### Payment Flow

1. **User adds items to cart** → Stored in cart context
2. **User clicks "Checkout"** → Navigates to `/checkout`
3. **User fills shipping details** → Submits checkout form
4. **Backend creates order** → Saves to database with PENDING status
5. **Backend calls Pesapal API** → Gets redirect URL
6. **User redirected to Pesapal** → Completes payment (M-Pesa, Card, etc.)
7. **Pesapal sends IPN** → Backend receives payment notification
8. **Backend updates order** → Sets status to COMPLETED/FAILED
9. **User redirected back** → Shows payment status at `/payment/callback`
10. **User can view orders** → At `/orders` page

### API Endpoints

#### Backend Routes (`/api/payments`)

- **POST `/checkout`** - Create order and initiate Pesapal payment
  - Requires: Authentication, cart items, shipping address
  - Returns: Pesapal redirect URL
- **GET `/ipn`** - Pesapal IPN callback endpoint
  - Query params: `OrderTrackingId`, `OrderMerchantReference`
  - Updates payment and order status
- **GET `/status/:orderTrackingId`** - Check payment status
  - Requires: Authentication
  - Returns: Payment and order details
- **GET `/orders`** - Get user's order history
  - Requires: Authentication
  - Returns: List of orders with items and payment info
- **POST `/register-ipn`** - Register IPN URL with Pesapal (one-time)
  - Requires: Authentication
  - Returns: IPN ID to save in .env

### Frontend Pages

- **`/checkout`** - Checkout form with cart summary
- **`/payment/callback`** - Payment result page (success/failed)
- **`/orders`** - Order history with payment status

## Testing

### Test Payment Flow

1. Add products to cart
2. Click "Checkout" in cart sidebar
3. Fill in shipping details:
   - Phone number (required): `+254712345678`
   - Address fields (required)
4. Click "Proceed to Payment"
5. You'll be redirected to Pesapal's payment page
6. **For sandbox testing**, use these test credentials:
   - M-Pesa: Use test numbers provided by Pesapal
   - Cards: Use Pesapal's test card numbers
   - Bank: Use test bank accounts

7. Complete payment
8. You'll be redirected back to your app showing payment status

### Check Order Status

1. Navigate to `/orders`
2. View all your orders with payment status
3. Each order shows:
   - Order number
   - Order status (PENDING, PROCESSING, etc.)
   - Payment status (PENDING, COMPLETED, FAILED)
   - Order items and totals

## Currency Configuration

The default currency is set to **KES (Kenyan Shillings)**. To change this:

1. Open `backend/services/pesapal.js`
2. Update the `formatOrderData` method:
   ```javascript
   currency: 'USD', // Change from 'KES' to your preferred currency
   ```

Supported currencies: KES, USD, EUR, GBP, TZS, UGX, etc.

## Troubleshooting

### IPN Not Working

1. Make sure `PESAPAL_IPN_ID` is set in `.env`
2. Ensure your `BACKEND_URL` is accessible from the internet (use ngrok for local testing)
3. Check backend logs for IPN callback errors

### Payment Status Not Updating

1. Check the IPN endpoint logs: `GET /api/payments/ipn`
2. Verify the `OrderTrackingId` in the payment table matches Pesapal's
3. Manually check status: `GET /api/payments/status/:orderTrackingId`

### Authentication Errors

1. Verify `PESAPAL_CONSUMER_KEY` and `PESAPAL_CONSUMER_SECRET` are correct
2. Check if you're using the right environment (sandbox vs production)
3. Ensure tokens are not expired (handled automatically)

## Production Deployment

When deploying to production:

1. **Update environment variables**:

   ```env
   PESAPAL_ENV="production"
   PESAPAL_CONSUMER_KEY="your_production_key"
   PESAPAL_CONSUMER_SECRET="your_production_secret"
   BACKEND_URL="https://your-api-domain.com"
   FRONTEND_URL="https://your-app-domain.com"
   ```

2. **Re-register IPN** with production credentials

3. **Test thoroughly** with real payment methods

4. **Enable HTTPS** - Pesapal requires secure connections

5. **Set up monitoring** for payment failures and IPN issues

## Security Notes

- Never commit `.env` files to version control
- Store Pesapal credentials securely
- Use HTTPS in production
- Validate all payment callbacks
- Log all transactions for audit purposes
- Implement rate limiting on payment endpoints

## Support

- **Pesapal Documentation**: https://developer.pesapal.com/
- **Pesapal Support**: support@pesapal.com
- **API Status**: Check Pesapal's status page

## License

This integration is part of your e-commerce project.
