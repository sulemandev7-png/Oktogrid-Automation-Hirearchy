@echo off
echo Installing Playwright browsers...
npx playwright install chromium
echo ✓ Browsers installed

echo Running basic test...
npx playwright test tests/specs/basic-test.spec.js
echo ✓ Test completed