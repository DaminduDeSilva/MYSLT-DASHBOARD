# MySLT Log Agent Installer (Windows)
# This script installs the log-agent.ps1 as a Windows Scheduled Task.

param(
    [string]$DashboardUrl = "http://124.43.216.137:5001/api/logs/ingest",
    [string]$ServerId = $env:COMPUTERNAME,
    [string]$LogFilePath = "C:\Logs\app.log",
    [string]$InstallDir = "C:\MySLT-Agent",
    [int]$BatchSize = 50,
    [int]$FlushIntervalSec = 5,
    [switch]$WithSimulator
)

# --- Check Administrator ---
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[ERROR] This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host "[SETUP] Starting MySLT Log Agent Installation" -ForegroundColor Green
Write-Host "--------------------------------------"
Write-Host "Dashboard: $DashboardUrl"
Write-Host "Server ID: $ServerId"
Write-Host "Log Path:  $LogFilePath"
Write-Host "Install:   $InstallDir"
if ($WithSimulator) { Write-Host "Simulator: Enabled" }
Write-Host "--------------------------------------"

# 1. Create Install Directory
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# 2. Copy scripts
$ScriptsToCopy = @("log-agent.ps1")
if ($WithSimulator) { $ScriptsToCopy += "simulate-logs.ps1" }

foreach ($script in $ScriptsToCopy) {
    # Try looking in PSScriptRoot first, then current directory
    $SourceScript = Join-Path $PSScriptRoot $script
    if (-not (Test-Path $SourceScript)) {
        $SourceScript = Join-Path (Get-Location) $script
    }

    if (Test-Path $SourceScript) {
        Copy-Item $SourceScript -Destination (Join-Path $InstallDir $script) -Force
        Write-Host "[OK] Copied $script to $InstallDir" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] $script not found!" -ForegroundColor Red
        exit 1
    }
}

# 3. Create Scheduled Task for Log Agent
Write-Host "[CONFIG] Configuring Log Agent Task..." -ForegroundColor Gray

$AgentTaskName = "MySLT-Log-Agent"
$AgentAction = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$InstallDir\log-agent.ps1`" -DashboardUrl `"$DashboardUrl`" -ServerId `"$ServerId`" -LogFilePath `"$LogFilePath`" -BatchSize $BatchSize -FlushIntervalSec $FlushIntervalSec" `
    -WorkingDirectory $InstallDir

$Trigger = New-ScheduledTaskTrigger -AtStartup
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# Register Agent Task
Unregister-ScheduledTask -TaskName $AgentTaskName -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName $AgentTaskName -Action $AgentAction -Trigger $Trigger -Settings $Settings -User "SYSTEM" -RunLevel Highest

Start-ScheduledTask -TaskName $AgentTaskName

# 4. Create Simulator Task (Optional)
if ($WithSimulator) {
    Write-Host "[CONFIG] Configuring Simulator Task..." -ForegroundColor Gray
    $SimTaskName = "MySLT-Log-Simulator"
    $SimAction = New-ScheduledTaskAction -Execute "PowerShell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$InstallDir\simulate-logs.ps1`" -LogFilePath `"$LogFilePath`" -IntervalSec 10" `
        -WorkingDirectory $InstallDir
    
    $SimTrigger = New-ScheduledTaskTrigger -AtStartup
    $SimSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    
    Unregister-ScheduledTask -TaskName $SimTaskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $SimTaskName -Action $SimAction -Trigger $SimTrigger -Settings $SimSettings -User "SYSTEM" -RunLevel Highest
    
    Start-ScheduledTask -TaskName $SimTaskName
}

Write-Host "--------------------------------------" -ForegroundColor Green
Write-Host "Installation Complete!"
Write-Host "The agent is now running as a Scheduled Task: $AgentTaskName"
if ($WithSimulator) {
    Write-Host "The simulator is also running: $SimTaskName"
}
Write-Host "It will start automatically on system boot."
Write-Host "--------------------------------------"

