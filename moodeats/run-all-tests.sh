#!/bin/bash

# MoodEats Comprehensive Test Runner
# Runs all test suites locally

echo "🧪 MoodEats Complete Test Suite"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall success
ALL_PASS=true

# Test 1: Data Validation
echo "📊 Stage 1: Data Validation Tests"
echo "---------------------------------"
if node test-meals.js; then
    echo -e "${GREEN}✅ Data validation passed${NC}"
else
    echo -e "${RED}❌ Data validation failed${NC}"
    ALL_PASS=false
fi
echo ""

# Test 2: DOM Structure
echo "🏗️ Stage 2: DOM Structure Tests"
echo "--------------------------------"
if node test-dom.js; then
    echo -e "${GREEN}✅ DOM structure tests passed${NC}"
else
    echo -e "${RED}❌ DOM structure tests failed${NC}"
    ALL_PASS=false
fi
echo ""

# Test 3: JSON Validation
echo "📋 Stage 3: JSON Syntax Validation"
echo "----------------------------------"
if python3 -m json.tool meals.json > /dev/null 2>&1; then
    echo -e "${GREEN}✅ meals.json is valid JSON${NC}"
else
    echo -e "${RED}❌ meals.json has JSON errors${NC}"
    ALL_PASS=false
fi
echo ""

# Test 4: Check file sizes
echo "📏 Stage 4: Performance Checks"
echo "------------------------------"
for file in *.html; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        size_kb=$((size / 1024))
        if [ $size -gt 200000 ]; then
            echo -e "${YELLOW}⚠️  $file is ${size_kb}KB (large)${NC}"
            if [ $size -gt 500000 ]; then
                echo -e "${RED}❌ $file is too large!${NC}"
                ALL_PASS=false
            fi
        else
            echo -e "${GREEN}✅ $file size OK (${size_kb}KB)${NC}"
        fi
    fi
done
echo ""

# Test 5: Search term validation
echo "🔍 Stage 5: Search Functionality"
echo "--------------------------------"
node -e "
const meals = require('./meals.json');
const searchTests = [
    { term: 'toast', minExpected: 3 },
    { term: 'chicken', minExpected: 10 },
    { term: 'eggs', minExpected: 5 }
];

let allPass = true;
searchTests.forEach(test => {
    const found = meals.filter(m =>
        m.searchTerms.some(term => term.includes(test.term)) ||
        m.name.toLowerCase().includes(test.term)
    );
    if (found.length >= test.minExpected) {
        console.log('✅ \"' + test.term + '\" returns ' + found.length + ' results');
    } else {
        console.log('❌ \"' + test.term + '\" only returns ' + found.length + ' results');
        allPass = false;
    }
});

if (!allPass) process.exit(1);
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Search tests passed${NC}"
else
    echo -e "${RED}❌ Search tests failed${NC}"
    ALL_PASS=false
fi
echo ""

# Test 6: Integration Tests (if browser available)
echo "🌐 Stage 6: Browser Integration Tests"
echo "-------------------------------------"
if command -v python3 &> /dev/null; then
    echo "Starting test server..."
    python3 -m http.server 8888 > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 2

    echo -e "${YELLOW}⚠️  Open http://localhost:8888/test-integration.html in your browser${NC}"
    echo "   to run full integration tests"
    echo ""
    echo "Press Enter when done..."
    read

    kill $SERVER_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Python not available for test server${NC}"
fi

# Summary
echo ""
echo "================================"
echo "📋 TEST SUMMARY"
echo "================================"

if [ "$ALL_PASS" = true ]; then
    echo -e "${GREEN}✅ ALL AUTOMATED TESTS PASSED!${NC}"
    echo ""
    echo "Don't forget to:"
    echo "  1. Run test-integration.html in a browser"
    echo "  2. Manually test the UI at moodeats-planner.html"
    echo "  3. Click all mood buttons"
    echo "  4. Test meal selection"
    echo "  5. Test search functionality"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please fix the failing tests before committing."
    exit 1
fi