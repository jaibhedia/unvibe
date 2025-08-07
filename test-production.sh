#!/bin/bash

# Production readiness test script
# This script validates that the application is ready for deployment

echo "🧪 Testing Production Readiness..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

test_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "Running production readiness tests..."
echo

# Test 1: Check if build works
echo "1. Testing build process..."
if npm run build > /dev/null 2>&1; then
    test_passed "Build process works"
else
    test_failed "Build process failed"
fi

# Test 2: Check for TypeScript errors
echo "2. Checking TypeScript compilation..."
if npm run type-check > /dev/null 2>&1; then
    test_passed "TypeScript compilation successful"
else
    test_failed "TypeScript compilation failed"
fi

# Test 3: Check for lint errors
echo "3. Checking code quality..."
if npm run lint > /dev/null 2>&1; then
    test_passed "Code linting passed"
else
    test_warning "Code linting issues found (run 'npm run lint:fix')"
fi

# Test 4: Check required files exist
echo "4. Checking deployment files..."
files=("vercel.json" "Dockerfile" "railway.json" ".env.production" "DEPLOYMENT.md")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        test_passed "Found $file"
    else
        test_failed "Missing $file"
    fi
done

# Test 5: Check backend requirements
echo "5. Checking backend requirements..."
if [ -f "backend/requirements.txt" ]; then
    test_passed "Backend requirements.txt exists"
else
    test_failed "Backend requirements.txt missing"
fi

# Test 6: Check for sensitive information
echo "6. Checking for sensitive information..."
if grep -r "localhost" src/ --exclude-dir=node_modules > /dev/null 2>&1; then
    test_warning "Found localhost references - ensure they're conditionally used"
else
    test_passed "No hardcoded localhost references found"
fi

# Test 7: Check environment configuration
echo "7. Checking environment configuration..."
if grep -q "VITE_API_BASE_URL" src/config/environment.ts; then
    test_passed "Environment configuration looks good"
else
    test_failed "Environment configuration needs review"
fi

echo
echo "📊 Test Results:"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your app is ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues before deploying.${NC}"
    exit 1
fi
