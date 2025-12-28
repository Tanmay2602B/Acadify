# Start server script with port check
Write-Host "=== Starting Acadify Server ===" -ForegroundColor Cyan

# Check if port 3000 is in use
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($process) {
    $pid = $process.OwningProcess
    Write-Host "⚠️  Port 3000 is already in use by process $pid" -ForegroundColor Yellow
    $response = Read-Host "Kill the existing process? (Y/N)"
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "Killing process $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force
        Start-Sleep -Seconds 2
        Write-Host "✅ Process killed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot start server. Port 3000 is in use." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Port 3000 is free. Starting server..." -ForegroundColor Green
Write-Host ""

# Start the server
npm start
