#!/bin/bash
echo "🔧 FINAL PLAYWRIGHT FIX"
echo "================================"

echo "Step 1: Complete clean install..."
rm -rf node_modules package-lock.json
npm install

echo ""
echo "Step 2: Install Playwright browsers..."
npx playwright install

echo ""
echo "Step 3: Test basic functionality..."
npx playwright test tests/specs/basic-test.spec.js

echo ""
echo "🎯 If this works, run:"
echo "npx playwright test simplified-partner-test.spec.js --headed"