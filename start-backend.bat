@echo off
echo Starting Spring Boot Application...
cd /d %~dp0backend
call mvn spring-boot:run
pause 