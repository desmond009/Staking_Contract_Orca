# 🚀 Deployment Guide

This guide will help you deploy your ORCA Staking frontend to various platforms.

## Prerequisites

1. **Environment Variables**: Ensure you have your contract addresses and RPC URL ready
2. **Build the App**: Run `npm run build` to create a production build
3. **Choose a Platform**: Select from the options below

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the easiest option for React/Vite apps.

#### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd orca-staking-frontend
   vercel
   ```

4. **Set Environment Variables**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add these variables:
     - `VITE_STAKING_CONTRACT_ADDRESS`
     - `VITE_ORCA_TOKEN_ADDRESS`
     - `VITE_RPC_URL`
     - `VITE_TARGET_CHAIN_ID`
     - `VITE_TARGET_NETWORK_NAME`

5. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

#### Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variables in the dashboard
6. Deploy!

---

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   cd orca-staking-frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variables**:
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add all `VITE_*` variables

#### Alternative: Drag & Drop

1. Build your app: `npm run build`
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder
4. Set environment variables in dashboard

---

### Option 3: GitHub Pages

#### Steps:

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.js**:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/' // Replace with your repo name
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

**Note**: GitHub Pages doesn't support environment variables easily. You'll need to hardcode values or use a different approach.

---

### Option 4: AWS S3 + CloudFront

#### Steps:

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Set up CloudFront** for HTTPS
4. **Configure bucket** for static website hosting

---

## Environment Variables

Make sure to set these in your deployment platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STAKING_CONTRACT_ADDRESS` | Staking contract address | `0x...` |
| `VITE_ORCA_TOKEN_ADDRESS` | ORCA token address | `0x...` |
| `VITE_RPC_URL` | RPC endpoint | `https://sepolia.infura.io/v3/...` |
| `VITE_TARGET_CHAIN_ID` | Chain ID | `11155111` |
| `VITE_TARGET_NETWORK_NAME` | Network name | `Sepolia` |

## Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview
```

The build output will be in the `dist/` directory.

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] App loads without errors
- [ ] Wallet connection works
- [ ] Network switching works
- [ ] Transactions can be sent
- [ ] HTTPS is enabled (required for MetaMask)

## Troubleshooting

### Build Fails

- Check that all dependencies are installed: `npm install`
- Check for linting errors: `npm run lint`
- Review console errors

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Redeploy after adding variables
- Check variable names match exactly

### Wallet Connection Issues

- Ensure site is served over HTTPS
- Check browser console for errors
- Verify contract addresses are correct

## Need Help?

- Check the main README.md for more details
- Review component-specific documentation
- Check browser console for errors

