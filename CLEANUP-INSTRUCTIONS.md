# 🚨 URGENT: Manual Cleanup Required

## The Problem
You have **two conflicting Playwright installations** that are causing the "test.describe() called here" error:
1. Root installation: `node_modules/@playwright/test`  
2. Refactored installation: `refactored/node_modules/@playwright/test`

## The Solution
**Manually delete the `refactored` directory completely**, then run the cleanup script.

## Manual Steps:

### Step 1: Delete Conflicting Directory
```bash
# In your file explorer or terminal:
rm -rf refactored/
# OR on Windows:
rmdir /s refactored
```

### Step 2: Run Cleanup Script
```bash
# Run the cleanup script I created:
./cleanup.bat

# OR manually:
npm install
npx playwright test simplified-partner-test.spec.js --headed
```

### Step 3: Verify Clean Installation
```bash
# These commands should now work:
npm run test:headed                    # ✅ Browser visible
npm run test:debug                     # ✅ Debug mode  
npm run test:partner                   # ✅ Specific test
```

## Why This Happened
The root `package.json` was pointing to dependencies inside the `refactored` directory, creating circular conflicts when both directories had their own `node_modules`.

## After Cleanup
You'll have a clean, single-level structure:
```
├── package.json                      # ✅ Clean config
├── playwright.config.js             # ✅ Points to ./tests/specs  
├── .env                              # ✅ Environment variables
└── tests/
    └── specs/
        └── simplified-partner-test.spec.js  # ✅ Working test
```

**The test creates the complete partner hierarchy: Partner → Branch → Branch User → Customer → End User** 🎯