param (
    [string]$Action
)

function Get-Status {
    $onedrive = Get-Process "OneDrive" -ErrorAction SilentlyContinue
    $exists = Test-Path "$env:LOCALAPPDATA\Microsoft\OneDrive\OneDrive.exe"
    
    # Hardened (Safe) if OneDrive is NOT running AND executable is missing
    $isHardened = (-not $onedrive) -and (-not $exists)
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "OneDrive is removed." } else { "OneDrive is installed." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    # Kill Process
    Stop-Process -Name "OneDrive" -Force -ErrorAction SilentlyContinue
    
    # Uninstall
    $setupPath = if (Test-Path "$env:SystemRoot\SysWOW64\OneDriveSetup.exe") {
        "$env:SystemRoot\SysWOW64\OneDriveSetup.exe"
    }
    else {
        "$env:SystemRoot\System32\OneDriveSetup.exe"
    }
    
    if (Test-Path $setupPath) {
        Start-Process $setupPath -ArgumentList "/uninstall" -Wait -NoNewWindow
    }
    
    # Cleanup remnants (Wait a bit for uninstall to finish file release)
    Start-Sleep -Seconds 2
    Remove-Item "$env:LOCALAPPDATA\Microsoft\OneDrive" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:ProgramData\Microsoft OneDrive" -Recurse -Force -ErrorAction SilentlyContinue
    
    return @{ success = $true; message = "OneDrive removed." } | ConvertTo-Json
}

function Disable-Hardening {
    # Attempt Re-install from system backup
    $setupPath = if (Test-Path "$env:SystemRoot\SysWOW64\OneDriveSetup.exe") {
        "$env:SystemRoot\SysWOW64\OneDriveSetup.exe"
    }
    else {
        "$env:SystemRoot\System32\OneDriveSetup.exe"
    }
    
    if (Test-Path $setupPath) {
        Start-Process $setupPath -Wait -NoNewWindow
        return @{ success = $true; message = "OneDrive re-installed." } | ConvertTo-Json
    }
    else {
        return @{ success = $false; message = "OneDrive installer not found." } | ConvertTo-Json
    }
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
