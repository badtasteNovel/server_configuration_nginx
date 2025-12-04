@echo off
chcp 65001 > nul
REM ---------- 設定 ----------
set PHP_DIR=C:\env\php
set PHP_FCGI_LISTEN=127.0.0.1:9000
set NGINX_DIR=C:\env\nginx-1.28.0

REM ---------- 強制 PHP-CGI 讀 php.ini ----------
set PHPRC=%PHP_DIR%

REM ---------- 停止舊 PHP-CGI ----------
tasklist /FI "IMAGENAME eq php-cgi.exe" 2>NUL | find /I "php-cgi.exe" >NUL
if %ERRORLEVEL%==0 (
    taskkill /f /im php-cgi.exe >nul 2>&1
)

REM ---------- 啟動 PHP-CGI ----------
start "" /B "%PHP_DIR%\php-cgi.exe" -b %PHP_FCGI_LISTEN%
echo PHP-CGI 已啟動
echo ===================
REM ---------- 新增：停止舊 NGINX 進程 (確保配置生效) ----------
tasklist /FI "IMAGENAME eq nginx.exe" 2>NUL | find /I "nginx.exe" >NUL
if %ERRORLEVEL%==0 (
    echo 停止舊 NGINX 進程...
    taskkill /f /im nginx.exe >nul 2>&1
)

REM ---------- 啟動 NGINX (使用新配置) ----------
start "" /B "%NGINX_DIR%\nginx.exe"
echo NGINX 已啟動
echo ===================
