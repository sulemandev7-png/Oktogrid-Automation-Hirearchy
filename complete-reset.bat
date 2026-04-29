@echo off
echo ====================================
echo     FINAL PLAYWRIGHT FIX
echo ====================================
echo.

echo Step 1: Complete clean install...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"
npm install
echo ✓ Clean install completed

echo.
echo Step 2: Installing Playwright browsers...
npx playwright install
echo ✓ Browsers installed

echo.
echo Step 3: Testing basic functionality...
npx playwright test tests/specs/basic-test.spec.js
echo.

echo.
echo Step 4: If basic test works, run main test...
npx playwright test tests/specs/simplified-partner-test.spec.js --headed
echo.

echo ====================================
echo   FINAL FIX COMPLETE
echo ====================================
echo.
echo If you still get errors, there may be a global
echo Playwright installation conflict. Try:
echo   npm uninstall -g @playwright/test
echo   npm uninstall -g playwright
echo.