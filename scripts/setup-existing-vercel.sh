#!/bin/bash

# Quick setup for existing Vercel deployment
# This script helps you set up GitHub Actions for your existing Vercel project

echo "========================================"
echo "   Existing Vercel Project Setup"
echo "   Repository: hellospeakwise-hq/speakwise-frontend"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}Since you have an existing Vercel deployment, follow these steps:${NC}"
echo ""
echo -e "${YELLOW}Step 1: Get your Vercel Project ID${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click on your 'speakwise-frontend' project"
echo "3. Go to Settings → General"
echo "4. Copy the 'Project ID' (it looks like: prj_xxxxxxxxxxxxx)"
echo ""

echo -e "${YELLOW}Step 2: Get your Vercel Org ID${NC}"
echo "1. In your Vercel dashboard, click on your team name in the top-left"
echo "2. Go to Settings"
echo "3. Copy the 'Team ID' or 'Org ID' (it looks like: team_xxxxxxxxxxxxx)"
echo ""

echo -e "${YELLOW}Step 3: Get your Vercel Token${NC}"
echo "1. Go to https://vercel.com/account/tokens"
echo "2. Click 'Create Token'"
echo "3. Name it 'GitHub Actions' or similar"
echo "4. Copy the token (it looks like: vercel_xxxxxxxxxxxxx)"
echo ""

echo -e "${BLUE}Now, let's add these to your GitHub repository secrets:${NC}"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI found! We can add secrets automatically.${NC}"
    echo ""
    
    # Check if logged in
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ You're logged in to GitHub CLI${NC}"
        echo ""
        
        read -p "Enter your Vercel Token: " VERCEL_TOKEN
        if [ -z "$VERCEL_TOKEN" ]; then
            echo -e "${RED}❌ Vercel Token is required${NC}"
            exit 1
        fi

        read -p "Enter your Vercel Org ID (Team ID): " VERCEL_ORG_ID
        if [ -z "$VERCEL_ORG_ID" ]; then
            echo -e "${RED}❌ Vercel Org ID is required${NC}"
            exit 1
        fi

        read -p "Enter your Vercel Project ID: " VERCEL_PROJECT_ID
        if [ -z "$VERCEL_PROJECT_ID" ]; then
            echo -e "${RED}❌ Vercel Project ID is required${NC}"
            exit 1
        fi

        echo ""
        echo -e "${BLUE}🔐 Adding secrets to GitHub repository...${NC}"

        # Add secrets
        if gh secret set VERCEL_TOKEN -b "$VERCEL_TOKEN"; then
            echo -e "${GREEN}✅ VERCEL_TOKEN added successfully${NC}"
        else
            echo -e "${RED}❌ Failed to add VERCEL_TOKEN${NC}"
            exit 1
        fi

        if gh secret set VERCEL_ORG_ID -b "$VERCEL_ORG_ID"; then
            echo -e "${GREEN}✅ VERCEL_ORG_ID added successfully${NC}"
        else
            echo -e "${RED}❌ Failed to add VERCEL_ORG_ID${NC}"
            exit 1
        fi

        if gh secret set VERCEL_PROJECT_ID -b "$VERCEL_PROJECT_ID"; then
            echo -e "${GREEN}✅ VERCEL_PROJECT_ID added successfully${NC}"
        else
            echo -e "${RED}❌ Failed to add VERCEL_PROJECT_ID${NC}"
            exit 1
        fi

        echo ""
        echo -e "${GREEN}🎉 All secrets added successfully!${NC}"
        
    else
        echo -e "${YELLOW}⚠️  Please log in to GitHub CLI first: gh auth login${NC}"
        exit 1
    fi
    
else
    echo -e "${YELLOW}⚠️  GitHub CLI not found. Adding secrets manually:${NC}"
    echo ""
    echo -e "${BLUE}Go to: https://github.com/hellospeakwise-hq/speakwise-frontend/settings/secrets/actions${NC}"
    echo ""
    echo "Add these three repository secrets:"
    echo "• VERCEL_TOKEN = (your token from step 3)"
    echo "• VERCEL_ORG_ID = (your org ID from step 2)"  
    echo "• VERCEL_PROJECT_ID = (your project ID from step 1)"
fi

echo ""
echo -e "${GREEN}========================================"
echo "✅ Setup Complete!"
echo "========================================${NC}"
echo ""
echo -e "${BLUE}What happens next:${NC}"
echo "1. Your GitHub Actions workflow is already configured"
echo "2. Every time you push to 'main' or 'frontend-setup' branch"
echo "3. GitHub will automatically build and deploy to your existing Vercel project"
echo "4. Your live site will be updated: https://speakwise-frontend-iota.vercel.app"
echo ""
echo -e "${YELLOW}Test it now:${NC}"
echo "git add ."
echo "git commit -m \"Setup automatic deployment\""
echo "git push origin main"
echo ""
echo -e "${BLUE}Monitor deployments at:${NC}"
echo "• GitHub Actions: https://github.com/hellospeakwise-hq/speakwise-frontend/actions"
echo "• Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo -e "${GREEN}🚀 Your project is now set up for automatic deployments!${NC}"