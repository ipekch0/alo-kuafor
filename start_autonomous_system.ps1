# AI Appointment System - Autonomous Startup Script
Write-Host "🚀 AI Appointment System - Otonom Mod Başlatılıyor..." -ForegroundColor Cyan

# Get the script's current directory to avoid path issues
$scriptPath = $PSScriptRoot
Write-Host "Çalışma Dizini: $scriptPath" -ForegroundColor Gray

# 1. Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
try {
    $backendProcess = Start-Process -FilePath "npm" -ArgumentList "run server" -WorkingDirectory $scriptPath -PassThru -NoNewWindow
} catch {
    Write-Error "Backend başlatılamadı: $_"
}

# 2. Start Ngrok Tunnel
Write-Host "Starting Ngrok Tunnel..." -ForegroundColor Yellow
# Using the local ngrok binary content if possible or the one in node_modules
$ngrokPath = ".\server\node_modules\.bin\ngrok.cmd" 
if (-not (Test-Path $ngrokPath)) {
    $ngrokPath = "ngrok" # Try global path
}

try {
    $ngrokProcess = Start-Process -FilePath $ngrokPath -ArgumentList "http 5000" -WorkingDirectory $scriptPath -PassThru -WindowStyle Minimized
} catch {
    Write-Error "Ngrok başlatılamadı: $_"
}

# 3. Wait for Ngrok to initialize and fetch URL
Write-Host "Waiting for Ngrok URL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$ngrokUrl = ""
$maxRetries = 10
$retryCount = 0

while ([string]::IsNullOrEmpty($ngrokUrl) -and $retryCount -lt $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
        $ngrokUrl = $response.tunnels[0].public_url
    } catch {
        Write-Host "Waiting for Ngrok API... ($retryCount/$maxRetries)"
        Start-Sleep -Seconds 2
        $retryCount++
    }
}

if ([string]::IsNullOrEmpty($ngrokUrl)) {
    Write-Error "❌ Ngrok URL alınamadı! Lütfen ngrok'un çalıştığından emin olun."
    Write-Host "Manuel kontrol: Siyah ngrok penceresi açık mı?"
    Read-Host "Devam etmek için Enter'a basın..."
    Exit
}

Write-Host "✅ Ngrok URL Found: $ngrokUrl" -ForegroundColor Green

# 4. Update Configuration Files
Write-Host "Updating Configuration Files..." -ForegroundColor Yellow

$apiJsPath = Join-Path $scriptPath "src\utils\api.js"
$aiApiJsPath = Join-Path $scriptPath "src\api\aiApi.js"

# Update api.js
if (Test-Path $apiJsPath) {
    $apiContent = Get-Content $apiJsPath -Raw
    $newApiContent = $apiContent -replace "baseURL: 'https://[^']+'", "baseURL: '$ngrokUrl/api'"
    Set-Content -Path $apiJsPath -Value $newApiContent
    Write-Host "Updated api.js"
} else {
    Write-Warning "api.js bulunamadı: $apiJsPath"
}

# Update aiApi.js
if (Test-Path $aiApiJsPath) {
    $aiApiContent = Get-Content $aiApiJsPath -Raw
    $newAiApiContent = $aiApiContent -replace "API_URL = 'https://[^']+'", "API_URL = '$ngrokUrl/api'"
    Set-Content -Path $aiApiJsPath -Value $newAiApiContent
    Write-Host "Updated aiApi.js"
} else {
    Write-Warning "aiApi.js bulunamadı: $aiApiJsPath"
}

# 5. Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npm" -ArgumentList "run dev:client" -WorkingDirectory $scriptPath -NoNewWindow
} catch {
    Write-Error "Frontend başlatılamadı: $_"
}

Write-Host "✅ Sistem Tamamen Başlatıldı!" -ForegroundColor Green
Write-Host "Backend URL: $ngrokUrl"
Write-Host "Frontend URL: http://localhost:5173"
Write-Host "⚠️  Meta Webhook URL'ini güncellemeyi unutmayın: $ngrokUrl/api/whatsapp/webhook"

# Keep the script running to hold the processes if needed
# Read-Host "Press Enter to exit"
