# Quick Start Guide - Admin Panel

## TL;DR - Get Running in 5 Minutes

### 1. Install MongoDB
```bash
# Option A: Use Docker (easiest)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option B: Install locally
brew install mongodb-community  # macOS
```

### 2. Create Environment File
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb://localhost:27017/zibara
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecretkey123changethisinproduction

NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-key
```

### 3. Seed Database
```bash
npm run seed-db
npm run seed-admin
```
The first command seeds the ZIBARASTUDIO storefront. The second creates your admin user.

### 4. Start Server
```bash
npm run dev
```

### 5. Login
Go to: http://localhost:3000/admin/login

Use the credentials you just created!

---

## Default Test Credentials

If you want to manually create a test admin in MongoDB:

**Email:** admin@zibarastudio.com  
**Password:** admin123

⚠️ **Change this immediately in production!**

To add this manually in MongoDB:
```javascript
db.admins.insertOne({
  email: "admin@zibarastudio.com",
  password: "$2a$10$YourHashedPasswordHere",
  name: "ZIBARA Admin",
  role: "super_admin",
  isActive: true,
  createdAt: new Date()
});
```

---

## Admin Panel URLs

- **Login**: http://localhost:3000/admin/login
- **Dashboard**: http://localhost:3000/admin
- **Products**: http://localhost:3000/admin/products
- **Orders**: http://localhost:3000/admin/orders
- **Site Content**: http://localhost:3000/admin/site-content

---

## Common Commands

```bash
# Start dev server
npm run dev

# Seed database with sample data
npm run seed-db

# Build for production
npm run build

# Start production server
npm start
```

---

## Troubleshooting

**NextAuth Error: "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"**
```bash
# Solution:
1. Create .env.local file in project root
2. Add NEXTAUTH_SECRET (required!)
3. Generate secret: openssl rand -base64 32
4. Restart dev server: npm run dev
```

**MongoDB won't connect?**
```bash
# Check if MongoDB is running
docker ps  # if using docker
mongosh    # try connecting directly
```

**Can't login?**
1. Make sure `.env.local` exists with `NEXTAUTH_SECRET`
2. Run `npm run seed-admin` to create an admin user
3. Clear browser cookies
4. Restart dev server
5. Check browser console for errors

**No products showing?**
- Run `npm run seed-db` to add the sample storefront data
- Check MongoDB connection
- Verify API route `/api/admin/products` works

---

## Next Steps

1. **Add real products** - Go to Products page and click "Add Product"
2. **Customize content** - Use Site Content page to edit text/images
3. **Process orders** - Orders page shows all customer orders
4. **Backup data** - Set up MongoDB backup strategy

---

## Production Checklist

Before going live:

- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Change all default passwords
- [ ] Enable HTTPS
- [ ] Set up automatic backups
- [ ] Add IP whitelist on MongoDB
- [ ] Review security settings
- [ ] Test payment integrations

---

## Need Help?

Read the detailed guides:
- `ADMIN_SETUP.md` - Full setup instructions
- `ADMIN_PANEL_SUMMARY.md` - Complete feature overview
- `PAYMENT_SETUP.md` - Payment gateway setup

Or check the code:
- Models in `/models/`
- API routes in `/app/api/admin/`
- Admin pages in `/app/admin/`
