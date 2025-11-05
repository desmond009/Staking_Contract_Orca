#!/bin/bash

# ORCA Staking Frontend - Quick Deploy Script

echo "🚀 ORCA Staking Frontend Deployment"
echo "===================================="
echo ""

# Check if build exists
if [ ! -d "dist" ]; then
    echo "📦 Building app..."
    npm run build
fi

echo ""
echo "✅ Build complete! Choose your deployment option:"
echo ""
echo "1. Vercel (Recommended)"
echo "   Run: vercel"
echo ""
echo "2. Netlify"
echo "   Run: netlify deploy --prod --dir=dist"
echo ""
echo "3. Preview build locally"
echo "   Run: npm run preview"
echo ""
echo "📝 Make sure to set environment variables in your platform:"
echo "   - VITE_STAKING_CONTRACT_ADDRESS"
echo "   - VITE_ORCA_TOKEN_ADDRESS"
echo "   - VITE_RPC_URL"
echo "   - VITE_TARGET_CHAIN_ID"
echo "   - VITE_TARGET_NETWORK_NAME"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

