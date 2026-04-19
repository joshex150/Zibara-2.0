# Admin Panel Setup Guide

## Prerequisites

1. **MongoDB**: You need a MongoDB database running. You can use:
   - Local MongoDB installation
   - MongoDB Atlas (cloud)
   - Docker MongoDB container

## ⚠️ IMPORTANT: Environment Variables Setup

**BEFORE starting the development server**, create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/crochella
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crochella?retryWrites=true&w=majority

# NextAuth Configuration (REQUIRED - DO NOT SKIP!)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Payment Gateways (Optional)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-public-key-here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-public-key-here
```

### Generate NextAuth Secret

**REQUIRED**: Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value in `.env.local`

### Common Error

If you see this error:
```
[next-auth][error][CLIENT_FETCH_ERROR] "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"
```

**Solution**: Make sure you have created `.env.local` and set `NEXTAUTH_SECRET`. Restart your dev server after creating the file.

## Initialize Admin User

Run the setup script to create your first admin user:

```bash
npm run setup-admin
```

This will prompt you to enter:
- Admin name
- Admin email  
- Admin password

## Default Admin Credentials (Development Only)

If you want to quickly test, you can manually create an admin user in MongoDB:

```javascript
// In MongoDB shell or Compass
db.admins.insertOne({
  email: "admin@crochellaa.ng",
  password: "$2a$10$K8yJ3Z9X5k.qZ9X5k.qZ9euBZ9X5k.qZ9X5k.qZ9X5k.qZ9X5k.q", // password: admin123
  name: "Admin User",
  role: "super_admin",
  isActive: true,
  createdAt: new Date()
});
```

**IMPORTANT**: Change this password immediately in production!

## Seed Database with Sample Data

To populate your database with sample products:

```bash
npm run seed-db
```

## Access the Admin Panel

1. Start your development server:
```bash
npm run dev
```

2. Navigate to: `http://localhost:3000/admin/login`

3. Log in with your admin credentials

## Admin Panel Features

### Dashboard (`/admin`)
- Overview of total products, orders, revenue
- Quick access to all management sections

### Products Management (`/admin/products`)
- View all products
- Filter by category and featured status
- Add new products
- Edit existing products
- Delete products
- Manage product images, prices, descriptions

### Orders Management (`/admin/orders`)
- View all customer orders
- Filter by order status and payment status
- Update order status
- View customer details
- Track shipments

### Site Content Management (`/admin/site-content`)
- Edit homepage text
- Update hero images
- Manage banner images
- Edit announcement bar text
- Update about page content

## MongoDB Collections

The admin panel uses the following MongoDB collections:

- `products` - Product catalog
- `orders` - Customer orders
- `sitecontents` - Editable site content
- `admins` - Admin users

## API Routes

All admin API routes are located in `/app/api/admin/`:

- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `GET /api/admin/products/[id]` - Get product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

Similar routes exist for orders and site-content.

## Security Notes

1. **Always use HTTPS in production**
2. **Use strong passwords** for admin accounts
3. **Keep your NEXTAUTH_SECRET secure** and never commit it
4. **Regularly backup your MongoDB database**
5. **Use MongoDB Atlas with IP whitelisting** in production
6. **Enable 2FA** if you add more admins

## Troubleshooting

### Cannot connect to MongoDB
- Check if MongoDB is running
- Verify MONGODB_URI is correct
- Check network/firewall settings

### NextAuth errors
- Ensure NEXTAUTH_URL matches your domain
- Verify NEXTAUTH_SECRET is set
- Clear cookies and try again

### Products not showing
- Run the seed script
- Check MongoDB connection
- Verify API routes are working

## Migration from Static Data

To migrate your existing static products to MongoDB:

1. Your current products are in `/data/products.ts`
2. Run the migration script:
```bash
npm run migrate-products
```

This will import all existing products into MongoDB.

## Support

For issues or questions:
- Check MongoDB connection first
- Review browser console for errors
- Check server logs in terminal
- Verify all environment variables are set

## Production Deployment

When deploying to production:

1. Use MongoDB Atlas or a managed MongoDB service
2. Set strong NEXTAUTH_SECRET
3. Update NEXTAUTH_URL to your production domain
4. Enable HTTPS
5. Set up proper backup strategy
6. Configure CORS if needed
7. Use environment variables for all sensitive data
