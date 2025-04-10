@echo off
echo Starting React Application...
cd /d %~dp0frontend
call npm run dev
pause 