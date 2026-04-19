# Deployment Guide - Environment Variables

## Payment Gateway Configuration

When deploying to production, you **must** set the following environment variables in your hosting platform:

### Required Environment Variables

#### Payment Gateway Public Keys (Client-Side)
These are used in the browser and must be prefixed with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-actual-public-key-here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-actual-public-key-here
# OR for production:
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your-actual-public-key-here
```

#### Payment Gateway Secret Keys (Server-Side)
These are used on the server for payment verification and should **NEVER** be exposed to the client:

```env
FLUTTERWAVE_SECRET_KEY=FLWSECK-your-actual-secret-key-here
PAYSTACK_SECRET_KEY=sk_test_your-actual-secret-key-here
# OR for production:
# PAYSTACK_SECRET_KEY=sk_live_your-actual-secret-key-here
```

### Other Required Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crochella

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## How to Set Environment Variables

### Vercel
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable with its value
4. Select the environment (Production, Preview, Development)
5. **Important**: After adding variables, redeploy your application

### Netlify
1. Go to **Site settings**
2. Navigate to **Environment variables**
3. Add each variable
4. Redeploy your site

### Other Platforms
Most hosting platforms have an environment variables section in their dashboard. Look for:
- **Environment Variables**
- **Config Variables**
- **Secrets**
- **Settings → Environment**

## Important Notes

1. **NEXT_PUBLIC_ Prefix**: Variables that start with `NEXT_PUBLIC_` are exposed to the browser. Only use this prefix for public keys, not secret keys.

2. **Secret Keys**: Never expose secret keys to the client. They should only be used in API routes (server-side).

3. **Rebuild Required**: After adding environment variables, you typically need to:
   - Rebuild your application
   - Or trigger a new deployment

4. **Key Validation**: The application will now:
   - Validate payment keys before allowing payment
   - Show a warning if keys are missing
   - Disable payment options if keys are invalid

## Testing Your Configuration

After setting environment variables:

1. **Check the checkout page**: You should see payment options enabled
2. **Check browser console**: No errors about missing keys
3. **Try a test payment**: Use test mode keys to verify everything works

## Troubleshooting

### "Payment gateway not configured" error
- Verify environment variables are set in your hosting platform
- Check that variable names are exactly correct (case-sensitive)
- Ensure you've redeployed after adding variables
- Check that `NEXT_PUBLIC_` prefix is used for public keys

### Payment gateway opens but fails
- Check that secret keys are set correctly
- Verify the keys match (test keys for test mode, live keys for production)
- Check server logs for verification errors

### Keys work locally but not in production
- Environment variables might not be set in production
- Variables might be set in wrong environment (e.g., only in development)
- Build might have been cached - try a fresh deployment

## Security Best Practices

1. **Never commit** `.env` files to git
2. **Use different keys** for development and production
3. **Rotate keys** periodically
4. **Monitor** payment logs for suspicious activity
5. **Use test mode** during development
