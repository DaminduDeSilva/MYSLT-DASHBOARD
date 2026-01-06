# MySLT High-Performance Log Simulator (No-Locking)
# Mimics a real production application by keeping file handle open
# Usage: powershell -File simulate-logs-fast.ps1 -IntervalMs 100

param(
    [string]$LogFilePath = "C:\Logs\test.log",
    [int]$IntervalMs = 1000 # Default: 1 log per second
)

Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host "[START] High-Performance Log Simulator" -ForegroundColor Green
Write-Host "Log Path: $LogFilePath"
Write-Host "Interval: $IntervalMs ms"
Write-Host "--------------------------------------"

# Ensure directory exists
$LogDir = [System.IO.Path]::GetDirectoryName($LogFilePath)
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# KEY FIX: Use FileShare.ReadWrite to allow Fluent Bit to read while we write
# Real apps (NLog, Log4j) do this. The old simulator was opening/closing constantly.
$FileStream = New-Object System.IO.FileStream(
    $LogFilePath, 
    [System.IO.FileMode]::Append, 
    [System.IO.FileAccess]::Write, 
    [System.IO.FileShare]::ReadWrite
)
$StreamWriter = New-Object System.IO.StreamWriter($FileStream)
$StreamWriter.AutoFlush = $true

$Methods = @("MOBILE", "DESKTOP", "WEB")
$Emails = @("user1@example.com", "user2@gmail.com", "test_customer@slt.lk", "admin@slt.lk")
$Statuses = @("Information", "Warning", "Error", "Critical")
$Apis = @("A01", "A02", "A03", "A04", "A05")

try {
    while ($true) {
        $Timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        
        $Method = $Methods[(Get-Random -Maximum $Methods.Count)]
        $Email = $Emails[(Get-Random -Maximum $Emails.Count)]
        $Status = $Statuses[(Get-Random -Maximum $Statuses.Count)]
        $Api = $Apis[(Get-Random -Maximum $Apis.Count)]
        $RespTime = Get-Random -Minimum 50 -Maximum 500
        $EndTimestamp = $Timestamp + $RespTime
        
        # CSV Format matching parser
        $LogLine = "$Timestamp,$Method,$Email,$Status,$Api,,$EndTimestamp,$RespTime,"
        
        $StreamWriter.WriteLine($LogLine)
        
        $CurrentTime = Get-Date -Format "HH:mm:ss"
        Write-Host "[$CurrentTime] Wrote: $Api ($Status)" -ForegroundColor Gray
        
        if ($IntervalMs -gt 0) {
            Start-Sleep -Milliseconds $IntervalMs
        }
    }
}
finally {
    $StreamWriter.Close()
    $FileStream.Close()
    Write-Host "Stopped."
}
