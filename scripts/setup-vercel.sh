#!/bin/bash

# SpeakWise Frontend - Vercel Deployment Setup Script
# ------------------------------------------------
# This script sets up Vercel deployment for GitHub Actions CI/CD

echo "========================================"
echo "   SpeakWise Vercel Deployment Setup"
echo "========================================"
echo ""

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: This is not a git repository.${NC}"
    exit 1
fi

# Check for required tools
echo -e "${BLUE}🔍 Checking required tools...${NC}"

# Check for jq (for JSON parsing)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install jq
        else
            echo -e "${RED}❌ Please install Homebrew first or install jq manually${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install jq -y
    else
        echo -e "${RED}❌ Please install jq manually for your operating system${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ jq found${NC}"
fi

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}🔍 Vercel CLI not found. Installing...${NC}"
    npm install -g vercel@latest
else
    echo -e "${GREEN}✅ Vercel CLI already installed: $(vercel --version)${NC}"
fi

echo ""
echo -e "${BLUE}🔑 Authenticating with Vercel...${NC}"
vercel login

echo ""
echo -e "${BLUE}🔗 Linking project to Vercel...${NC}"
vercel link

echo ""
echo -e "${BLUE}📊 Getting Vercel project information...${NC}"

# Get project info with error handling
PROJECT_INFO=$(vercel project ls --format json 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$PROJECT_INFO" ]; then
    echo -e "${RED}❌ Failed to get project information. Make sure you're logged in and have linked the project.${NC}"
    exit 1
fi

PROJECT_ID=$(echo "$PROJECT_INFO" | jq -r '.[0].id' 2>/dev/null)
ORG_ID=$(echo "$PROJECT_INFO" | jq -r '.[0].orgId' 2>/dev/null)

if [ "$PROJECT_ID" == "null" ] || [ "$ORG_ID" == "null" ]; then
    echo -e "${RED}❌ Failed to extract project information. Please try linking again.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Project linked successfully!${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Org ID: ${ORG_ID}${NC}"

# Get the repository URL for GitHub secrets setup
REPO_URL=$(git remote get-url origin 2>/dev/null | sed 's/\.git$//')
if [[ $REPO_URL == *"github.com"* ]]; then
    # Convert SSH to HTTPS URL for display
    REPO_URL=$(echo $REPO_URL | sed 's/git@github.com:/https:\/\/github.com\//')
    SECRETS_URL="${REPO_URL}/settings/secrets/actions"
else
    SECRETS_URL="your GitHub repository settings > Secrets and variables > Actions"
fi

echo ""
echo -e "${YELLOW}====== GitHub Repository Secrets Setup ======${NC}"
echo ""
echo -e "${BLUE}You need to add the following secrets to your GitHub repository:${NC}"
echo ""
echo -e "${GREEN}1. Go to: ${SECRETS_URL}${NC}"
echo ""
echo -e "${GREEN}2. Add these repository secrets:${NC}"
echo ""
echo -e "${YELLOW}Secret Name: VERCEL_TOKEN${NC}"
echo -e "Secret Value: <Get from https://vercel.com/account/tokens>"
echo ""
echo -e "${YELLOW}Secret Name: VERCEL_ORG_ID${NC}"
echo -e "Secret Value: ${ORG_ID}"
echo ""
echo -e "${YELLOW}Secret Name: VERCEL_PROJECT_ID${NC}"
echo -e "Secret Value: ${PROJECT_ID}"
echo ""
echo "📝 Note: Make sure to also set the NEXT_PUBLIC_API_URL environment variable"
echo "in your Vercel project settings for production deployments."
echo ""

# Check if the existing CI/CD workflow exists
if [ -f ".github/workflows/nextjs-ci-cd.yml" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflow already exists and configured!${NC}"
    echo -e "${BLUE}Your workflow will automatically:${NC}"
    echo "• Deploy to production when you push to 'main' branch"
    echo "• Deploy to production when you push to 'frontend-setup' branch"
    echo "• Create preview deployments for pull requests to 'main'"
else
    echo -e "${YELLOW}⚠️  No GitHub Actions workflow found. Your existing setup should handle deployments.${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Testing your setup...${NC}"
echo "You can test the deployment by:"
echo "1. Adding the GitHub secrets mentioned above"
echo "2. Pushing a commit to your main branch"
echo "3. Checking the Actions tab in your GitHub repository"

echo ""
echo -e "${GREEN}========================================"
echo "✅ Setup Complete!"
echo "========================================${NC}"
echo ""
echo -e "${BLUE}What happens next:${NC}"
echo "1. Set up the GitHub secrets mentioned above"
echo "2. Push changes to your repository"
echo "3. Your app will automatically deploy to Vercel!"
echo ""
echo -e "${BLUE}Deployment triggers (based on your current workflow):${NC}"
echo "• Push to 'main' branch → Production deployment"
echo "• Push to 'frontend-setup' branch → Production deployment"
echo "• Pull requests to 'main' → Build and test (no deployment)"
echo ""
echo -e "${GREEN}🎉 Your project is configured for automatic Vercel deployments!${NC}"
