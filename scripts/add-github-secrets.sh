#!/bin/bash

# Helper script to add GitHub secrets using GitHub CLI
# Repository: https://github.com/hellospeakwise-hq/speakwise-frontend.git

echo "========================================"
echo "   GitHub Secrets Setup Helper"
echo "   Repository: hellospeakwise-hq/speakwise-frontend"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found.${NC}"
    echo -e "${BLUE}Please install it from: https://cli.github.com/${NC}"
    echo ""
    echo "On macOS: brew install gh"
    echo "On Ubuntu: sudo apt install gh"
    echo ""
    echo -e "${YELLOW}Alternatively, you can add secrets manually at:${NC}"
    echo "https://github.com/hellospeakwise-hq/speakwise-frontend/settings/secrets/actions"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔑 Please log in to GitHub CLI first:${NC}"
    gh auth login
fi

# Check if we're in the right repository
CURRENT_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ "$CURRENT_REPO" != "hellospeakwise-hq/speakwise-frontend" ]; then
    echo -e "${YELLOW}⚠️  Warning: Current directory doesn't seem to be the speakwise-frontend repo${NC}"
    echo -e "${BLUE}Current repo: ${CURRENT_REPO}${NC}"
    echo -e "${BLUE}Expected: hellospeakwise-hq/speakwise-frontend${NC}"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔍 First, let's get your Vercel project information...${NC}"
echo ""
echo -e "${YELLOW}To find your Vercel project details:${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click on your speakwise-frontend project"
echo "3. Go to Settings > General"
echo "4. Copy the Project ID from there"
echo ""
echo -e "${YELLOW}To get your Vercel Token:${NC}"
echo "1. Go to https://vercel.com/account/tokens"
echo "2. Create a new token with a descriptive name like 'GitHub Actions'"
echo "3. Copy the token"
echo ""
echo -e "${YELLOW}To get your Org ID:${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click on your team/organization name in the top left"
echo "3. Go to Settings"
echo "4. The Org ID is shown in the General section"
echo ""

read -p "Enter your Vercel Token: " VERCEL_TOKEN

read -p "Enter your Vercel Token (from https://vercel.com/account/tokens): " VERCEL_TOKEN
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ Vercel Token is required${NC}"
    exit 1
fi

read -p "Enter your Vercel Org ID: " VERCEL_ORG_ID
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

# Add secrets one by one with error handling
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
echo -e "${BLUE}Your repository is now ready for automatic Vercel deployments.${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Push a commit to your 'main' or 'frontend-setup' branch"
echo "2. Check the Actions tab at: https://github.com/hellospeakwise-hq/speakwise-frontend/actions"
echo "3. Your app will be automatically deployed to Vercel!"
echo ""
echo -e "${BLUE}Your existing Vercel deployment will be updated automatically on every push!${NC}"