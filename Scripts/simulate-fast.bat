@echo off
setlocal enabledelayedexpansion

set "LOGFILE=C:\Logs\test.log"
set "INTERVAL_MS=100"

echo --------------------------------------
echo [START] Batch Log Simulator (Turbo)
echo Log Path: %LOGFILE%
echo Interval: ~10ms (approx)
echo --------------------------------------

:loop
set "TIMESTAMP=%time%"
set "UNIXTIME=1767735000000"
:: Note: True ms timestamp in batch is hard, using static prefix + random for simplicity in simulation
set /a "RANDOM_ID=%random% %% 1000"
set "FULL_TIME=%UNIXTIME%%RANDOM_ID%"

set /a "RAND_METHOD=%random% %% 3"
if %RAND_METHOD%==0 set "METHOD=MOBILE"
if %RAND_METHOD%==1 set "METHOD=DESKTOP"
if %RAND_METHOD%==2 set "METHOD=WEB"

set /a "RAND_STATUS=%random% %% 4"
if %RAND_STATUS%==0 set "STATUS=Information"
if %RAND_STATUS%==1 set "STATUS=Warning"
if %RAND_STATUS%==2 set "STATUS=Error"
if %RAND_STATUS%==3 set "STATUS=Critical"

set "LOGLINE=%FULL_TIME%,%METHOD%,user@example.com,%STATUS%,A01,,%FULL_TIME%,100,"

echo %LOGLINE% >> "%LOGFILE%"
echo [%time%] Wrote log

:: Small delay loop
for /L %%i in (1,1,200) do rem

goto loop
