#!/bin/bash

# Deployment script for Vibe Reverse Engineer Platform
# This script handles both frontend (Vercel) and backend (Railway) deployment

set -e  # Exit on any error

echo "🚀 Starting Vibe Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git."
        exit 1
    fi
    
    print_success "All dependencies are installed."
}

# Build and test the application
build_and_test() {
    print_status "Building and testing the application..."
    
    # Install dependencies
    npm install
    
    # Run tests if they exist
    if npm run test --if-present; then
        print_success "Tests passed."
    else
        print_warning "No tests found or tests failed."
    fi
    
    # Build the application
    npm run build
    print_success "Application built successfully."
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod --confirm
    print_success "Frontend deployed to Vercel."
}

# Deploy backend to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Deploy to Railway
    railway up
    print_success "Backend deployed to Railway."
}

# Main deployment function
main() {
    print_status "🚀 Starting Vibe Platform Deployment Process"
    
    check_dependencies
    build_and_test
    
    echo ""
    print_status "Choose deployment option:"
    echo "1) Deploy frontend only (Vercel)"
    echo "2) Deploy backend only (Railway)"
    echo "3) Deploy both frontend and backend"
    echo "4) Exit"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_frontend
            ;;
        2)
            deploy_backend
            ;;
        3)
            deploy_backend
            deploy_frontend
            ;;
        4)
            print_status "Deployment cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    print_status "Remember to update your environment variables with the correct URLs."
}

# Run the main function
main "$@"
