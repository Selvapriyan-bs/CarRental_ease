# Razorpay Payment Integration Setup

## How to Get Razorpay API Keys

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com/
2. Click "Sign Up" and create an account
3. Complete the registration process

### Step 2: Get Test API Keys
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Click "Generate Test Key"
4. Copy the Key ID and Key Secret

### Step 3: Update .env File
Replace the values in `backend/.env`:

```
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
```

### Step 4: Test Payment
- Use test mode for development
- Test card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV

## Features Implemented

✅ **Razorpay Checkout Integration**
- UPI payments (GPay, PhonePe, Paytm, BHIM)
- Credit/Debit cards
- Net Banking
- Wallets

✅ **Payment Verification**
- Server-side signature verification
- Secure payment confirmation

✅ **Mock Mode**
- Works without real API keys for testing
- Simulates successful payment

✅ **Booking Creation**
- Automatic booking after successful payment
- Payment ID stored in database
- 10% platform fee calculation
- Vendor payment calculation

## Payment Flow

1. User selects dates and clicks "Pay"
2. Razorpay order created on backend
3. Razorpay checkout modal opens
4. User completes payment
5. Payment verified on backend
6. Booking created in database
7. User redirected to dashboard

## Testing Without Real Keys

The system works in mock mode if:
- RAZORPAY_KEY_ID is not set
- RAZORPAY_KEY_ID = 'rzp_test_your_actual_key_id'

Mock mode simulates successful payment after 2 seconds.
