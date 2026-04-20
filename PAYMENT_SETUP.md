# Payment Integration Setup Guide

## Overview

ZIBARASTUDIO supports two payment gateways for processing transactions:
- **Flutterwave** - Supports card payments, bank transfers, and USSD
- **Paystack** - Supports card payments and bank transfers

## Setup Instructions

### 1. Get API Keys

#### Flutterwave
1. Sign up at [https://flutterwave.com](https://flutterwave.com)
2. Go to Settings > API Keys
3. Copy your **Public Key** (starts with `FLWPUBK-`)

#### Paystack
1. Sign up at [https://paystack.com](https://paystack.com)
2. Go to Settings > API Keys & Webhooks
3. Copy your **Public Key** (starts with `pk_test_` for test mode)

### 2. Create Environment File

Create a file named `.env.local` in the project root with:

```env
# Flutterwave API Keys
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-actual-public-key-here

# Paystack API Keys  
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-actual-public-key-here
```

**Important:** Never commit `.env.local` to version control!

### 3. Test Mode vs Live Mode

**For Development/Testing:**
- Use test API keys
- Test cards are available in the documentation
- No real money is charged

**For Production:**
- Replace test keys with live keys
- Complete KYC verification on both platforms
- Enable your preferred payment methods

### 4. Test Cards

#### Flutterwave Test Cards
- **Success:** 4187427415564246
- **Insufficient Funds:** 4187427415564248
- CVV: Any 3 digits | Expiry: Any future date | PIN: 3310 | OTP: 12345

#### Paystack Test Cards
- **Success:** 4084084084084081
- **Insufficient Funds:** 5060666666666666666
- CVV: Any 3 digits | Expiry: Any future date | PIN: 1234 | OTP: 123456

### 5. Webhook Setup (Optional - for production)

To receive payment confirmations:

**Flutterwave:**
1. Go to Settings > Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/flutterwave`
3. Copy the secret hash

**Paystack:**
1. Go to Settings > API Keys & Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Copy the secret key

### 6. Security Notes

- Always validate payments on the backend before fulfilling orders
- Never expose secret keys in client-side code
- Use environment variables for all API keys
- Enable 3D Secure for card payments
- Monitor transactions regularly for fraud

## Customer Support

For payment issues or questions:
- Email: studio@zibarastudio.com
- Phone: +234 801 234 5678

## Resources

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Paystack Documentation](https://paystack.com/docs)
