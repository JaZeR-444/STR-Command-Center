# Vercel Deployment Guide

## Quick Deploy

### Method 1: Deploy from Project Directory (Recommended)

```bash
cd str-command-center
vercel
```

Vercel will automatically detect Next.js and configure everything correctly.

### Method 2: Deploy from Root Directory

The root `vercel.json` is configured to deploy the `str-command-center` subdirectory.

```bash
# From C:\Rental Docs
vercel
```

## Vercel Configuration

Two `vercel.json` files are configured:

### Root: `C:\Rental Docs\vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "str-command-center/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "str-command-center/$1"
    }
  ]
}
```

This configuration tells Vercel:
- Use Next.js builder for the subdirectory
- Route all requests to the Next.js app

### App: `C:\Rental Docs\str-command-center\vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

This ensures Vercel recognizes it as a Next.js project.

## Git Deployment (Recommended for Production)

### 1. Initialize Git Repository

```bash
cd str-command-center
git init
git add .
git commit -m "Initial commit - STR Command Center v2.1"
```

### 2. Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/str-command-center.git
git branch -M main
git push -u origin main
```

### 3. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### 4. Auto-Deploy on Push

Once connected, every push to `main` branch will automatically deploy to Vercel.

## Environment Variables (Optional)

### Supabase Cloud Sync (Free Tier)

If you want to enable cloud sync across devices:

1. In Vercel dashboard → Your Project → Settings → Environment Variables
2. Add these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_STATE_KEY=family
```

3. Redeploy the project

**Note**: The app works perfectly fine without these variables using localStorage only.

## Custom Domain

1. Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `launch.yourdomain.com`)
3. Update DNS records as instructed by Vercel
4. SSL certificate auto-generated

## Build Output

Successful build will show:

```
Route (app)              Size     First Load JS
┌ ○ /                    4.24 kB  207 kB
├ ○ /documents           4.56 kB  201 kB
├ ○ /focus               4.32 kB  200 kB
├ ○ /roadmap             5.59 kB  202 kB
└ ○ /settings            3.32 kB  199 kB
```

All routes are statically rendered (○) for optimal performance.

## Troubleshooting

### Build Fails with "Cannot find module"
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

### 404 on Routes
- Verify `vercel.json` routing configuration
- Check if deploying from correct directory

### Environment Variables Not Working
- Environment variables must start with `NEXT_PUBLIC_` to be available in browser
- Redeploy after adding environment variables

### Build Times Out
- Next.js 14 typically builds in 30-60 seconds
- If timing out, check for infinite loops in components

## Post-Deployment Checklist

✅ All pages load correctly  
✅ Command palette opens with CMD+K  
✅ Sidebar collapse works  
✅ Task completion persists (localStorage)  
✅ Filter and search work  
✅ Mobile responsive layout  
✅ No console errors  
✅ Custom domain (if configured)  
✅ SSL certificate active  

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

For app issues:
- Check browser console for errors
- Verify localStorage is enabled
- Try clearing browser cache
