param (
    [string]$Action
)

function Get-Status {
    $diagTrack = Get-Service -Name "DiagTrack" -ErrorAction SilentlyContinue
    $allowTelemetry = Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -ErrorAction SilentlyContinue

    $isEnabled = ($diagTrack.Status -eq "Stopped") -and ($allowTelemetry.AllowTelemetry -eq 0)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "System telemetry is disabled." } else { "System telemetry is active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Stop-Service -Name "DiagTrack" -ErrorAction SilentlyContinue
    Set-Service -Name "DiagTrack" -StartupType Disabled
    Stop-Service -Name "dmwappushservice" -ErrorAction SilentlyContinue
    Set-Service -Name "dmwappushservice" -StartupType Disabled
    
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection")) {
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Force | Out-Null
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Value 0

    return @{ success = $true; message = "Telemetry disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Set-Service -Name "DiagTrack" -StartupType Automatic
    Start-Service -Name "DiagTrack" -ErrorAction SilentlyContinue
    Set-Service -Name "dmwappushservice" -StartupType Manual
    
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -ErrorAction SilentlyContinue

    return @{ success = $true; message = "Telemetry restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
