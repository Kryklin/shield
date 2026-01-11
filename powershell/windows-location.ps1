param (
    [string]$Action
)

function Get-Status {
    $lfsvc = Get-Service -Name "lfsvc" -ErrorAction SilentlyContinue
    # 0 = Off, 1 variable... usually standard registry key for system-wide toggle is AllowLocation
    $allowLocation = Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Name "DisableLocation" -ErrorAction SilentlyContinue

    $isEnabled = ($lfsvc.Status -eq "Stopped") -or ($allowLocation.DisableLocation -eq 1)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "Location services are disabled." } else { "Location services are active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Stop-Service -Name "lfsvc" -ErrorAction SilentlyContinue
    Set-Service -Name "lfsvc" -StartupType Disabled
    
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors")) {
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Force | Out-Null
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Name "DisableLocation" -Value 1

    return @{ success = $true; message = "Location services disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Set-Service -Name "lfsvc" -StartupType Manual
    
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Name "DisableLocation" -ErrorAction SilentlyContinue

    return @{ success = $true; message = "Location services restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
