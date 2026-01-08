$envPath = "server\.env"
$lines = Get-Content $envPath
$token = ""
$id = ""

foreach ($line in $lines) {
    if ($line -match "WHATSAPP_ACCESS_TOKEN=(.*)") { $token = $matches[1].Trim('"') }
    if ($line -match "WHATSAPP_PHONE_NUMBER_ID=(.*)") { $id = $matches[1].Trim('"') }
}

Write-Host "Token Length: $($token.Length)"
Write-Host "ID: $id"

if ($id -eq "" -or $token -eq "") {
    Write-Host "ERROR: Missing credentials in .env"
    exit
}

$url = "https://graph.facebook.com/v17.0/$id/messages"
$body = @{
    messaging_product = "whatsapp"
    to = "905551234567"
    type = "text"
    text = @{ body = "PowerShell Test" }
} | ConvertTo-Json -Depth 3

try {
    $res = Invoke-RestMethod -Uri $url -Method Post -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $body
    Write-Host "SUCCESS: Message ID $($res.messages[0].id)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "DETAILS: $($reader.ReadToEnd())"
}
