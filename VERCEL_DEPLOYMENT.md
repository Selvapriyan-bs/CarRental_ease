# Vercel Deployment Guide

## Prerequisites
1. Create a Vercel account at https://vercel.com
2. Install Vercel CLI: `npm install -g vercel`
3. Set up MongoDB Atlas (free tier) at https://www.mongodb.com/cloud/atlas

## Step 1: Deploy Backend

### 1.1 Navigate to backend folder
```bash
cd backend
```

### 1.2 Login to Vercel
```bash
vercel login
```

### 1.3 Deploy backend
```bash
vercel
```

### 1.4 Add Environment Variables in Vercel Dashboard
Go to your backend project in Vercel Dashboard → Settings → Environment Variables

Add these variables:
- `MONGO_URI` = Your MongoDB Atlas connection string
- `JWT_SECRET` = Any random secure string
- `EMAIL_USER` = Your email
- `EMAIL_PASS` = Your email app password
- `RAZORPAY_KEY_ID` = Your Razorpay key
- `RAZORPAY_KEY_SECRET` = Your Razorpay secret
- `STRIPE_SECRET_KEY` = Your Stripe secret key

### 1.5 Redeploy after adding environment variables
```bash
vercel --prod
```

### 1.6 Note your backend URL
Example: `https://your-backend.vercel.app`

## Step 2: Update Frontend API URLs

### 2.1 Create .env file in project folder
```bash
cd ../project
```

Create `.env` file:
```
VITE_API_URL=https://your-backend.vercel.app
```

### 2.2 Update API calls to use environment variable

In `src/services/api.js`, update the base URL:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## Step 3: Deploy Frontend

### 3.1 Build the frontend
```bash
npm run build
```

### 3.2 Deploy to Vercel
```bash
vercel
```

### 3.3 Deploy to production
```bash
vercel --prod
```

## Step 4: Configure MongoDB Atlas

1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
3. Database Access → Create a database user
4. Get connection string and add to Vercel environment variables

## Important Notes

### File Uploads
Vercel has read-only filesystem. For production, use:
- **Cloudinary** (recommended for images)
- **AWS S3**
- **Vercel Blob Storage**

### Update server.js for file uploads
Replace multer local storage with cloud storage service.

## Testing

1. Backend: `https://your-backend.vercel.app/api/vehicles`
2. Frontend: `https://your-frontend.vercel.app`

## Troubleshooting

### Backend not working
- Check Vercel logs: `vercel logs`
- Verify environment variables are set
- Check MongoDB connection string

### Frontend API errors
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

## Alternative: Deploy Both Together

You can also deploy the entire project as a monorepo:
1. Create `vercel.json` in root
2. Configure builds for both frontend and backend
3. Deploy from root directory

## Continuous Deployment

Connect your GitHub repository to Vercel for automatic deployments:
1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Configure build settings
4. Every push to main branch will auto-deploy
