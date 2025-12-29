# MySLT Log Forwarding Agent (Windows PowerShell)
# This script watches a log file and sends new lines to the Dashboard API.

# --- Configuration ---
$DashboardUrl = $env:DASHBOARD_URL -or "http://localhost:5000/api/logs/ingest"
$ServerId = $env:SERVER_ID -or "WINDOWS_SERVER_01"
$LogFilePath = $env:LOG_FILE_PATH -or "C:\Logs\filtered-log.txt"
$BatchSize = $env:BATCH_SIZE -or 50
$FlushIntervalSec = $env:SLEEP_INTERVAL -or 5
# ---------------------

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 MySLT Log Agent starting (Windows)..." -ForegroundColor Green
Write-Host "📡 Dashboard: $DashboardUrl"
Write-Host "🆔 Server ID: $ServerId"
Write-Host "📂 Log File:  $LogFilePath"
Write-Host "📦 Batch Size: $BatchSize"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (-not (Test-Path $LogFilePath)) {
    Write-Host "❌ Error: Log file not found at $LogFilePath" -ForegroundColor Red
    exit 1
}

$LogBuffer = New-Object System.Collections.Generic.List[string]
$LastSendTime = Get-Date

function Send-Batch {
    if ($LogBuffer.Count -gt 0) {
        $Payload = @{
            serverIdentifier = $ServerId
            logs = $LogBuffer.ToArray()
        } | ConvertTo-Json
        
        try {
            $Response = Invoke-RestMethod -Uri $DashboardUrl -Method Post -Body $Payload -ContentType "application/json"
            if ($Response.success -eq $true) {
                Write-Host "✅ Sent $($LogBuffer.Count) lines." -ForegroundColor Gray
                $LogBuffer.Clear()
            } else {
                Write-Host "❌ Failed to send logs: $($Response.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Network error sending logs: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Use .NET to watch for file updates (more efficient than Get-Content -Wait)
$Reader = New-Object System.IO.StreamReader([System.IO.File]::Open($LogFilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite))
$Reader.BaseStream.Seek(0, [System.IO.SeekOrigin]::End)

Write-Host "👀 Watching for new log entries..." -ForegroundColor Yellow

while ($true) {
    $Line = $Reader.ReadLine()
    if ($Line -ne $null) {
        $LogBuffer.Add($Line)
        
        if ($LogBuffer.Count -ge $BatchSize) {
            Send-Batch
            $LastSendTime = Get-Date
        }
    } else {
        # No new lines, check if it's time to flush
        $TimeSinceLastSend = (Get-Date) - $LastSendTime
        if ($TimeSinceLastSend.TotalSeconds -ge $FlushIntervalSec) {
            Send-Batch
            $LastSendTime = Get-Date
        }
        Start-Sleep -Milliseconds 500
    }
}
