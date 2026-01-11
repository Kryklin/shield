param (
    [string]$Action = "Status"
)

function Get-Status {
    $svc = Get-Service wuauserv
    
    # Check Driver Key
    $driverKey = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
    $driversExcluded = 0
    if (Test-Path $driverKey) {
        $val = Get-ItemProperty -Path $driverKey -Name "ExcludeWUDriversInQualityUpdate" -ErrorAction SilentlyContinue
        if ($val) { $driversExcluded = $val.ExcludeWUDriversInQualityUpdate }
    }

    return @{ status = $svc.Status; startType = $svc.StartType; driversExcluded = [bool]$driversExcluded }
}

if ($Action -eq "Status") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "ToggleDrivers") {
    $driverKey = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
    if (-not (Test-Path $driverKey)) { New-Item -Path $driverKey -Force | Out-Null }
    
    $current = 0
    $val = Get-ItemProperty -Path $driverKey -Name "ExcludeWUDriversInQualityUpdate" -ErrorAction SilentlyContinue
    if ($val) { $current = $val.ExcludeWUDriversInQualityUpdate }
    
    # Toggle
    $newVal = if ($current -eq 1) { 0 } else { 1 }
    Set-ItemProperty -Path $driverKey -Name "ExcludeWUDriversInQualityUpdate" -Value $newVal
    
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Freeze") {
    # Disable Windows Update Service
    Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
    Set-Service wuauserv -StartupType Disabled
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Unfreeze") {
    # Enable Windows Update Service
    Set-Service wuauserv -StartupType Manual
    Start-Service wuauserv
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "ClearCache") {
    try {
        Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
        Stop-Service bits -Force -ErrorAction SilentlyContinue
        
        $path = "$env:SystemRoot\SoftwareDistribution"
        if (Test-Path $path) {
            Remove-Item -Path "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        Start-Service wuauserv
        return @{ success = $true } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
