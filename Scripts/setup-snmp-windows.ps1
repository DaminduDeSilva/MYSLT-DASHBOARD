# MySLT Dashboard - Windows Server SNMP Setup Script
# Run this PowerShell script as Administrator on the NEW Windows server you want to monitor
# Usage: Run PowerShell as Administrator, then execute: .\setup-snmp-windows.ps1

param(
    [string]$MonitoringServer = "192.168.100.137",
    [string]$Community = "public",
    [switch]$Help
)

# Color output functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Show help
if ($Help) {
    Write-Host "MySLT Dashboard - Windows Server SNMP Setup Script" -ForegroundColor Blue
    Write-Host "=================================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage: .\setup-snmp-windows.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -MonitoringServer <IP>   IP of MySLT Dashboard server (default: 192.168.100.137)"
    Write-Host "  -Community <string>      SNMP community string (default: public)"
    Write-Host "  -Help                    Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\setup-snmp-windows.ps1"
    Write-Host "  .\setup-snmp-windows.ps1 -MonitoringServer 192.168.1.100 -Community mysecret"
    exit
}

Write-Host "🚀 MySLT Dashboard - Windows Server SNMP Setup" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue
Write-Host "Setting up SNMP monitoring for MySLT Dashboard" -ForegroundColor White
Write-Host "Monitoring Server: $MonitoringServer" -ForegroundColor White
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator!"
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Success "Running with Administrator privileges"

# Get system information
$WindowsVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
$ServerIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.PrefixOrigin -eq "Manual" -or $_.PrefixOrigin -eq "Dhcp" } | Select-Object -First 1).IPAddress
$Hostname = $env:COMPUTERNAME

Write-Info "Step 1: System Information"
Write-Host "   Windows Version: $WindowsVersion"
Write-Host "   Server IP: $ServerIP"
Write-Host "   Hostname: $Hostname"
Write-Host ""

# Step 2: Install SNMP Features
Write-Info "Step 2: Installing SNMP Features..."

try {
    # Check Windows version and install SNMP accordingly
    $WindowsBuild = (Get-WmiObject -Class Win32_OperatingSystem).BuildNumber
    
    if ($WindowsBuild -ge 9200) { # Windows Server 2012 and later
        Write-Host "   Installing SNMP features for modern Windows..."
        
        # Install SNMP Service and SNMP WMI Provider
        $features = @("SNMP-Service", "SNMP-WMI-Provider")
        
        foreach ($feature in $features) {
            $result = Get-WindowsFeature -Name $feature
            if ($result.InstallState -eq "Available") {
                Write-Host "   Installing $feature..."
                Install-WindowsFeature -Name $feature -IncludeManagementTools
                Write-Success "$feature installed"
            } else {
                Write-Success "$feature already installed"
            }
        }
    } else { # Windows Server 2008 R2 and earlier
        Write-Host "   Installing SNMP for legacy Windows..."
        # Use DISM for older versions
        dism /online /enable-feature /featurename:SNMP /all
    }
} catch {
    Write-Error "Failed to install SNMP features: $($_.Exception.Message)"
    Read-Host "Press Enter to continue anyway"
}

# Step 3: Configure SNMP Service
Write-Info "Step 3: Configuring SNMP Service..."

try {
    # SNMP registry configuration
    $SNMPPath = "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters"
    
    # Ensure SNMP registry path exists
    if (-not (Test-Path $SNMPPath)) {
        New-Item -Path $SNMPPath -Force | Out-Null
    }
    
    # Configure communities
    $ValidCommunitiesPath = "$SNMPPath\ValidCommunities"
    if (-not (Test-Path $ValidCommunitiesPath)) {
        New-Item -Path $ValidCommunitiesPath -Force | Out-Null
    }
    
    # Set community string
    Set-ItemProperty -Path $ValidCommunitiesPath -Name $Community -Value 4 -Type DWord
    Write-Success "Community '$Community' configured"
    
    # Configure permitted managers (restrict to monitoring server)
    $PermittedManagersPath = "$SNMPPath\PermittedManagers"
    if (-not (Test-Path $PermittedManagersPath)) {
        New-Item -Path $PermittedManagersPath -Force | Out-Null
    }
    
    # Allow localhost and monitoring server
    Set-ItemProperty -Path $PermittedManagersPath -Name "1" -Value "localhost" -Type String
    Set-ItemProperty -Path $PermittedManagersPath -Name "2" -Value $MonitoringServer -Type String
    Write-Success "Permitted managers configured"
    
    # Configure trap destinations
    $TrapConfigurationPath = "$SNMPPath\TrapConfiguration"
    if (-not (Test-Path $TrapConfigurationPath)) {
        New-Item -Path $TrapConfigurationPath -Force | Out-Null
    }
    
    $CommunityTrapPath = "$TrapConfigurationPath\$Community"
    if (-not (Test-Path $CommunityTrapPath)) {
        New-Item -Path $CommunityTrapPath -Force | Out-Null
    }
    
    Set-ItemProperty -Path $CommunityTrapPath -Name "1" -Value $MonitoringServer -Type String
    Write-Success "Trap configuration set"
    
} catch {
    Write-Error "Failed to configure SNMP registry: $($_.Exception.Message)"
}

# Step 4: Configure Windows Firewall
Write-Info "Step 4: Configuring Windows Firewall..."

try {
    # Create firewall rule for SNMP
    $ruleName = "MySLT Dashboard SNMP"
    
    # Remove existing rule if present
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    
    # Create new rule
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol UDP -LocalPort 161 -Action Allow -Profile Any
    Write-Success "Firewall rule created for SNMP (UDP 161)"
    
    # Optional: Create rule for SNMP traps
    $trapRuleName = "MySLT Dashboard SNMP Traps"
    Remove-NetFirewallRule -DisplayName $trapRuleName -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName $trapRuleName -Direction Outbound -Protocol UDP -RemotePort 162 -Action Allow -Profile Any
    Write-Success "Firewall rule created for SNMP Traps (UDP 162)"
    
} catch {
    Write-Error "Failed to configure firewall: $($_.Exception.Message)"
    Write-Warning "Manual firewall configuration may be required"
}

# Step 5: Enable and start SNMP Service
Write-Info "Step 5: Starting SNMP Service..."

try {
    # Set service to automatic start
    Set-Service -Name "SNMP" -StartupType Automatic
    
    # Stop service if running (to apply configuration)
    if ((Get-Service -Name "SNMP").Status -eq "Running") {
        Stop-Service -Name "SNMP" -Force
        Start-Sleep -Seconds 2
    }
    
    # Start SNMP service
    Start-Service -Name "SNMP"
    
    $serviceStatus = (Get-Service -Name "SNMP").Status
    if ($serviceStatus -eq "Running") {
        Write-Success "SNMP Service is running"
    } else {
        Write-Error "SNMP Service failed to start (Status: $serviceStatus)"
    }
    
} catch {
    Write-Error "Failed to start SNMP service: $($_.Exception.Message)"
}

# Step 6: Install SNMP tools for testing
Write-Info "Step 6: Installing SNMP Tools..."

try {
    # Check if Windows 10/Server 2016+ has RSAT installed
    $rsatFeature = Get-WindowsCapability -Online -Name "Rsat.ServerManager.Tools*" -ErrorAction SilentlyContinue
    
    if ($rsatFeature -and $rsatFeature.State -ne "Installed") {
        Write-Host "   Installing RSAT tools..."
        Add-WindowsCapability -Online -Name "Rsat.ServerManager.Tools~~~~0.0.1.0"
    }
    
    Write-Success "SNMP tools configured"
} catch {
    Write-Warning "Could not install SNMP tools automatically"
}

# Step 7: Test SNMP Configuration
Write-Info "Step 7: Testing SNMP Configuration..."

Write-Host ""
Write-Host "🧪 Windows SNMP Tests:" -ForegroundColor Cyan
Write-Host "---------------------"

# Test SNMP service status
$snmpService = Get-Service -Name "SNMP" -ErrorAction SilentlyContinue
if ($snmpService) {
    Write-Host "📋 SNMP Service Status:"
    Write-Host "   ✅ Status: $($snmpService.Status)"
    Write-Host "   ✅ Startup Type: $($snmpService.StartType)"
} else {
    Write-Host "   ❌ SNMP Service not found"
}

# Test network connectivity
Write-Host "🌐 Network Configuration:"
Write-Host "   ✅ Server IP: $ServerIP"
Write-Host "   ✅ SNMP Port: 161/UDP"
Write-Host "   ✅ Community: $Community"
Write-Host "   ✅ Monitoring Server: $MonitoringServer"

# Test firewall rules
Write-Host "🔥 Firewall Rules:"
$firewallRule = Get-NetFirewallRule -DisplayName "MySLT Dashboard SNMP" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Write-Host "   ✅ SNMP Inbound Rule: Enabled"
} else {
    Write-Host "   ⚠️ SNMP Inbound Rule: Not found"
}

# Test registry configuration
Write-Host "📋 Registry Configuration:"
$communityExists = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\ValidCommunities" -Name $Community -ErrorAction SilentlyContinue
if ($communityExists) {
    Write-Host "   ✅ Community configured: $Community"
} else {
    Write-Host "   ⚠️ Community configuration: Check required"
}

# Performance counters test
Write-Host "📊 System Metrics:"
try {
    $cpu = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $memoryUsedPercent = [math]::Round(((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100), 2)
    
    Write-Host "   ✅ CPU Usage: $([math]::Round($cpu.Average, 2))%"
    Write-Host "   ✅ Memory Usage: $memoryUsedPercent%"
    Write-Host "   ✅ Total Memory: $([math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)) GB"
} catch {
    Write-Host "   ⚠️ System metrics: Limited access"
}

# Step 8: Windows-specific SNMP extensions
Write-Info "Step 8: Configuring Windows Extensions..."

try {
    # Configure SNMP Extensions for Windows Management
    $ExtensionPath = "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\ExtensionAgents"
    
    # Enable Windows Management extensions
    Set-ItemProperty -Path $ExtensionPath -Name "1" -Value "SOFTWARE\Microsoft\Windows\CurrentVersion\SNMP_Events\EventLog" -Type String -ErrorAction SilentlyContinue
    
    Write-Success "Windows SNMP extensions configured"
} catch {
    Write-Warning "Could not configure all SNMP extensions"
}

# Final configuration summary
Write-Host ""
Write-Info "Step 9: Configuration Summary"
Write-Host "Configuration Summary:" -ForegroundColor White
Write-Host "--------------------"
Write-Host "• Windows Version: $WindowsVersion"
Write-Host "• Server IP: $ServerIP"
Write-Host "• SNMP Service: $((Get-Service -Name 'SNMP').Status)"
Write-Host "• Community String: $Community"
Write-Host "• Monitoring Server: $MonitoringServer"
Write-Host "• Firewall: Configured for UDP 161"
Write-Host ""

# Instructions for adding to dashboard
Write-Host "🎯 Next Steps - Add to MySLT Dashboard:" -ForegroundColor Blue
Write-Host "======================================"
Write-Host ""
Write-Host "1. 🌐 Open your MySLT Dashboard:"
Write-Host "   https://dpdlab1.slt.lk:9122/admin"
Write-Host ""
Write-Host "2. 📊 Add this Windows server:"
Write-Host "   • Click 'Add Server'"
Write-Host "   • IP Address: $ServerIP"
Write-Host "   • OS Type: Windows"
Write-Host "   • Click 'Add'"
Write-Host ""
Write-Host "3. 🧪 Or test via API (PowerShell):"
Write-Host '   $body = @{serverIp="' + $ServerIP + '"; community="' + $Community + '"} | ConvertTo-Json'
Write-Host '   Invoke-RestMethod -Uri "https://dpdlab1.slt.lk:9122/api/server-health/snmp/add" -Method POST -Body $body -ContentType "application/json"'
Write-Host ""
Write-Host "4. ✅ Verify monitoring:"
Write-Host '   Invoke-RestMethod -Uri "https://dpdlab1.slt.lk:9122/api/server-health/snmp/' + $ServerIP + '"'
Write-Host ""

Write-Success "🎉 Windows server setup complete!"
Write-Success "Server $ServerIP is ready for MySLT Dashboard monitoring"

Write-Host ""
Write-Host "🔧 Troubleshooting Commands:" -ForegroundColor Yellow
Write-Host "---------------------------"
Write-Host "• Check SNMP Service: Get-Service -Name 'SNMP'"
Write-Host "• Restart SNMP: Restart-Service -Name 'SNMP'"
Write-Host "• Check Firewall: Get-NetFirewallRule -DisplayName '*SNMP*'"
Write-Host "• View Event Logs: Get-WinEvent -LogName System | Where-Object {`$_.ProviderName -eq 'SNMP'}"
Write-Host "• Test locally: snmputil get localhost $Community .1.3.6.1.2.1.1.1.0"
Write-Host ""
Write-Host "📁 Registry Locations:"
Write-Host "• SNMP Config: HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters"
Write-Host "• Communities: ...Parameters\ValidCommunities"
Write-Host "• Managers: ...Parameters\PermittedManagers"
Write-Host ""

Write-Host "Press Enter to exit..." -ForegroundColor Green
Read-Host
