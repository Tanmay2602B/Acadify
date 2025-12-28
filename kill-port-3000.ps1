# Kill process using port 3000
Write-Host "Checking for processes using port 3000..." -ForegroundColor Yellow

$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($process) {
    $pid = $process.OwningProcess
    Write-Host "Found process $pid using port 3000" -ForegroundColor Red
    Write-Host "Killing process..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force
    Start-Sleep -Seconds 1
    Write-Host "✅ Process killed! Port 3000 is now free." -ForegroundColor Green
} else {
    Write-Host "✅ Port 3000 is already free!" -ForegroundColor Green
}

Write-Host "`nYou can now run: npm start" -ForegroundColor Cyan
