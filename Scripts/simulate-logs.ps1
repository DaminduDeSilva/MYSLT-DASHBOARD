# MySLT Log Simulator (Windows PowerShell)
# This script generates mock log entries for testing purposes.

param(
    [string]$LogFilePath = "C:\Logs\app.log",
    [int]$IntervalSec = 5
)

Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host "[START] MySLT Log Simulator starting (Windows)..." -ForegroundColor Green
Write-Host "Log Path: $LogFilePath"
Write-Host "Interval: $IntervalSec seconds"
Write-Host "--------------------------------------"


# Ensure directory exists
$LogDir = [System.IO.Path]::GetDirectoryName($LogFilePath)
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

if (-not (Test-Path $LogFilePath)) {
    New-Item -ItemType File -Path $LogFilePath -Force | Out-Null
}

$Methods = @("MOBILE", "DESKTOP", "WEB")
$Emails = @("user1@example.com", "user2@gmail.com", "test_customer@slt.lk")
$Statuses = @("Information", "Warning", "Error", "Critical")
$Apis = @("A01", "A02", "A03", "A04", "A05")

while ($true) {
    $Timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    
    # Pick random values
    $Method = $Methods[(Get-Random -Maximum $Methods.Count)]
    $Email = $Emails[(Get-Random -Maximum $Emails.Count)]
    $Status = $Statuses[(Get-Random -Maximum $Statuses.Count)]
    $Api = $Apis[(Get-Random -Maximum $Apis.Count)]
    
    $RespTime = Get-Random -Minimum 100 -Maximum 1000
    $EndTimestamp = $Timestamp + $RespTime
    
    # Format: startTimestamp,accessMethod,customerEmail,status,apiNumber,,endTimestamp,responseTime,serverIdentifier
    $LogLine = "$Timestamp,$Method,$Email,$Status,$Api,,$EndTimestamp,$RespTime,"
    
    # Use explicit shared access to avoid "file in use" errors with the agent
    $FileStream = New-Object System.IO.FileStream($LogFilePath, [System.IO.FileMode]::Append, [System.IO.FileAccess]::Write, [System.IO.FileShare]::ReadWrite)
    $StreamWriter = New-Object System.IO.StreamWriter($FileStream)
    $StreamWriter.WriteLine($LogLine)
    $StreamWriter.Dispose()
    $FileStream.Dispose()
    
    $CurrentTime = Get-Date -Format "HH:mm:ss"
    Write-Host "[OK] [$CurrentTime] Generated: $Api ($Status) for $Email" -ForegroundColor Gray

    
    Start-Sleep -Seconds $IntervalSec
}
