@echo off
echo ====================================
echo    OKTOGRID DEBUG TEST RUN
echo ====================================
echo.
echo Running test with API interception and debugging...
echo Screenshots will be saved for each step.
echo API calls will be logged to console.
echo.

npx playwright test tests/specs/simplified-partner-test.spec.js --headed --reporter=list

echo.
echo ====================================
echo         DEBUG COMPLETE
echo ====================================
echo.
echo Check the console output above for:
echo   🔵 API REQUEST logs
echo   🟢 API RESPONSE logs  
echo   📊 API calls summary
echo   🚨 Any failed API calls
echo.
echo Check for screenshot files:
echo   debug-before-branch-*.png
echo   debug-partner-expanded-*.png
echo   debug-branch-dialog-*.png
echo   debug-before-enduser-*.png
echo   debug-enduser-dialog-*.png
echo.
pause