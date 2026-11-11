@echo off
title Deploy ke GitHub Pages - SIP Gotong Royong Waru
echo ==========================================================
echo   DEPLOY APLIKASI KE GITHUB PAGES
echo   SIP-Gotong Royong Kecamatan Waru
echo ==========================================================
echo.
echo Langkah 1: Membangun versi produksi (npm run build)...
call npm.cmd run build
if %ERRORLEVEL% neq 0 (
    echo Error: Gagal build aplikasi!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Langkah 2: Mengunggah berkas ke GitHub Pages (npm run deploy)...
call npm.cmd run deploy
if %ERRORLEVEL% neq 0 (
    echo.
    echo PERHATIAN: Pastikan Anda sudah menghubungkan remote GitHub dengan perintah:
    echo git remote add origin https://github.com/USERNAME/NAMA-REPO.git
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo   BERHASIL! Aplikasi telah terunggah ke GitHub Pages.
echo   Buka repo GitHub ^> Settings ^> Pages untuk melihat URL aktif.
echo ==========================================================
pause
