#!/bin/bash

# SpeakWise Frontend - Vercel Deployment Setup Script
# ------------------------------------------------
# This script sets up Vercel deployment for GitHub Actions CI/CD

echo "========================================"
echo "   SpeakWise Vercel Deployment Setup"
echo "========================================"
echo ""

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "🔍 Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI already installed."
fi

echo ""
echo "🔑 Authenticating with Vercel..."
vercel login

echo ""
echo "🔗 Linking project to Vercel..."
vercel link

echo ""
echo "📊 Getting Vercel project information..."
echo ""
echo "====== GitHub Repository Secrets Setup ======"
echo ""
echo "Run the following commands to set up GitHub repository secrets:"
echo ""
echo "1. Get your Vercel token from: https://vercel.com/account/tokens"
echo "2. Add the following secrets to your GitHub repository:"
echo ""
echo "VERCEL_TOKEN=<your_vercel_token>"

# Get project info
PROJECT_ID=$(vercel project ls -j | jq -r '.[0].id')
ORG_ID=$(vercel project ls -j | jq -r '.[0].orgId')

echo "VERCEL_ORG_ID=$ORG_ID"
echo "VERCEL_PROJECT_ID=$PROJECT_ID"
echo ""
echo "Go to: https://github.com/Darkbeast-glitch/speakwise-frontend-new/settings/secrets/actions"
echo "to add these secrets."
echo ""
echo "📝 Note: Make sure to also set the NEXT_PUBLIC_API_URL environment variable"
echo "in your Vercel project settings for production deployments."
echo ""
echo "========================================"
echo "✅ Setup complete! Your project is now configured for Vercel deployments via GitHub Actions."
echo "========================================"
