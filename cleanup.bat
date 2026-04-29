@echo off
echo ====================================
echo    OKTOGRID PLAYWRIGHT CLEANUP
echo ====================================
echo.
echo This script will clean up the conflicting Playwright installations.
echo.

echo Step 1: Removing old conflicting files...
if exist "refactored" (
    echo Removing refactored directory...
    rmdir /s /q "refactored"
    echo ✓ Removed refactored directory
) else (
    echo ✓ refactored directory already removed
)

echo.
echo Step 2: Removing old test files...
if exist "basic-test.spec.js" del "basic-test.spec.js"
if exist "seed.spec.ts" del "seed.spec.ts"
if exist "simplified-partner-test.spec.js" del "simplified-partner-test.spec.js"
if exist "FINAL-WORKING-test.spec.js" del "FINAL-WORKING-test.spec.js"
if exist "WORKING-partner-test.spec.js" del "WORKING-partner-test.spec.js"
if exist "debug-*.png" del "debug-*.png"
if exist "specs" rmdir /s /q "specs"
echo ✓ Removed old test files

echo.
echo Step 3: Reinstalling dependencies...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"
echo ✓ Cleaned node_modules
npm install
echo ✓ Reinstalled dependencies

echo.
echo Step 4: Running test...
echo Testing the cleaned installation...
npx playwright test simplified-partner-test.spec.js --headed
echo.

echo ====================================
echo       CLEANUP COMPLETE!
echo ====================================
echo.
echo You can now run tests with:
echo   npm test                    (headless)
echo   npm run test:headed         (with browser)
echo   npm run test:debug          (debug mode)
echo   npm run test:partner        (specific test)
echo.

pause