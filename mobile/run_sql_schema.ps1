# IGO Academy - Supabase Schema Runner
# Run this script in PowerShell to execute the schema on Supabase

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   IGO Academy - Supabase Schema Runner" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Open the Supabase SQL Editor in Chrome
$sqlEditorUrl = "https://supabase.com/dashboard/project/bmrkjcxffduqdjonxvqg/sql/new"
Write-Host "[1/3] Opening Supabase SQL Editor in browser..." -ForegroundColor Yellow
Start-Process $sqlEditorUrl
Start-Sleep -Seconds 3

# Read the SQL file
$sqlFile = Join-Path $PSScriptRoot "supabase_schema.sql"
if (Test-Path $sqlFile) {
    $sqlContent = Get-Content $sqlFile -Raw
    Set-Clipboard -Value $sqlContent
    Write-Host "[2/3] SQL schema copied to clipboard!" -ForegroundColor Green
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "   ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  The Supabase SQL Editor should now be open in Chrome." -ForegroundColor White
    Write-Host "  The full SQL schema is already in your clipboard." -ForegroundColor White
    Write-Host ""
    Write-Host "  Steps:" -ForegroundColor Yellow
    Write-Host "  1. Click inside the SQL editor textarea" -ForegroundColor White
    Write-Host "  2. Press Ctrl+A to select all (clear existing)" -ForegroundColor White
    Write-Host "  3. Press Ctrl+V to paste the schema SQL" -ForegroundColor White
    Write-Host "  4. Click the 'Run' button (or press Ctrl+Enter)" -ForegroundColor White
    Write-Host ""
    Write-Host "[3/3] Done! Follow the steps above." -ForegroundColor Green
} else {
    Write-Host "ERROR: supabase_schema.sql not found at: $sqlFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
