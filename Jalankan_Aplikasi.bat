@echo off
title SIP-Gotong Royong Kecamatan Waru
echo ========================================================
echo   SIP-GOTONG ROYONG KECAMATAN WARU
echo   Pemerintah Kabupaten Penajam Paser Utara
echo   Database: Google Sheets ^& Drive (waruppusigap@gmail.com)
echo ========================================================
echo.
echo Sedang memulai server aplikasi lokal...
start "" "http://localhost:5173"
call npm.cmd run dev
pause
