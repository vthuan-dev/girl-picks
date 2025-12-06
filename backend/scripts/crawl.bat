@echo off
REM Crawler script for Windows
REM Usage:
REM   crawl.bat              - Crawl page 1, 60 items
REM   crawl.bat 1            - Crawl page 1, 60 items
REM   crawl.bat 1 60         - Crawl page 1, 60 items
REM   crawl.bat 1 60 5       - Crawl pages 1 to 5

set PAGE=%1
if "%PAGE%"=="" set PAGE=1

set LIMIT=%2
if "%LIMIT%"=="" set LIMIT=60

set END_PAGE=%3

echo 🚀 Starting crawler...
echo 📄 Page: %PAGE%
echo 📊 Limit: %LIMIT%
if not "%END_PAGE%"=="" echo 📚 End Page: %END_PAGE%
echo.

if not "%END_PAGE%"=="" (
  npm run crawl %PAGE% %LIMIT% %END_PAGE%
) else (
  npm run crawl %PAGE% %LIMIT%
)

