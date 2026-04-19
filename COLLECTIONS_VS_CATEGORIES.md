# Collections vs Categories - Implementation Guide

## ⚠️ DISK SPACE ISSUE
Your disk is at 100% capacity (202Gi / 228Gi used). Please free up space before continuing.

## What's Been Updated

### 1. New Collection Model Created
**File**: `/models/Collection.ts`
- Stores curated seasonal/named drops
- Fields: name, slug, season, year, description, writeUp, coverImage, productIds
- Example: "RTW Fall 2022", "Summer Escape 2023"

### 2. Collection API Routes Created
- `POST/GET /api/admin/collections` - List/create collections
- `GET/PUT/DELETE /api/admin/collections/[id]` - Single collection operations

### 3. Current Page Structure

**Categories** (`/collection` - KEEP AS IS):
- Shows products grouped by type (Tops, Dresses, Skirts)
- Already updated with better header: "SHOP BY CATEGORY"

**Collections** (NEEDS TO BE CREATED):
- Will show curated named drops with stories
- Each collection has write-up, season, year
- Links to collection detail pages

## What Still Needs To Be Done

Due to disk space, you need to:

### 1. Free Up Disk Space
```bash
# Check what's using space
du -sh ~/Desktop/* | sort -h
# Clean npm cache
npm cache clean --force
# Clean node_modules if needed
```

### 2. Then Create These Files:

**A. Collections Listing Page** (`/app/collections/page.tsx`):
```typescript
- Fetches from /api/admin/collections?published=true
- Shows grid of collections with cover images
- Each card shows: name, season/year, description, product count
- Links to /collections/[slug]
```

**B. Single Collection Page** (`/app/collections/[slug]/page.tsx`):
```typescript
- Shows collection header with write-up
- Displays all products in that collection
- Rich editorial content
```

**C. Admin Collections Manager** (`/app/admin/collections/page.tsx`):
```typescript
- Create/edit/delete collections
- Assign products to collections
- Set cover images
- Write collection stories
```

## Quick Implementation

Once you have disk space:

### Step 1: Update Header Navigation
```typescript
// components/Header.tsx
const navigationLinks = [
  { href: '/about', label: "about crochella" },
  { href: '/shop', label: 'shop' },
  { href: '/collection', label: 'categories' },  // Products by type
  { href: '/collections', label: 'collections' }, // Curated drops
  { href: '/contact', label: 'reach out' },
];
```

### Step 2: Create Collections Page
Copy from `/app/collection/page.tsx` but:
- Fetch from `/api/admin/collections`
- Show seasonal drops with write-ups
- Link to `/collections/[slug]` for detail

### Step 3: Add to Admin Dashboard
```typescript
// In /app/admin/page.tsx menuItems
{
  title: 'Collections',
  description: 'Manage seasonal drops',
  href: '/admin/collections',
  icon: Layers,
  color: 'bg-indigo-500',
}
```

## Example Collection Data

```javascript
{
  name: "RTW Fall 2022",
  slug: "rtw-fall-2022",
  season: "Fall",
  year: 2022,
  description: "Warm tones and cozy textures for autumn",
  writeUp: "As leaves turn golden and the air grows crisp, our Fall 2022 ready-to-wear collection celebrates the season's rich palette. Hand-crocheted pieces in burnt orange, deep burgundy, and forest green create a modern bohemian wardrobe perfect for layering...",
  coverImage: "https://...",
  productIds: ["id1", "id2", "id3"],
  featured: true,
  published: true
}
```

## Directory Structure

```
/app
  /collection          # Categories (by product type)
  /collections         # Named drops (seasonal/themed)
    /[slug]           # Single collection detail
  /admin
    /collections      # Manage collections
```

## API Usage

```typescript
// Get all published collections
fetch('/api/admin/collections?published=true')

// Get featured collections
fetch('/api/admin/collections?featured=true')

// Create collection
fetch('/api/admin/collections', {
  method: 'POST',
  body: JSON.stringify(collectionData)
})
```

## Summary

**Categories** = Product types (what it is: Top, Dress, Skirt)
**Collections** = Curated drops (when/why: Fall 2022, Summer Escape)

Both are now set up in the backend - you just need disk space to create the frontend pages!
