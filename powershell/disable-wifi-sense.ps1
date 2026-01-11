param (
    [string]$Action
)

function Get-Status {
    # No direct single registry key for "Wi-Fi Sense" in newer Windows 10/11 as it was largely removed/integrated.
    # We check the broader "Wi-Fi Hotspot 2.0" and auto-connect settings if possible, or legacy keys.
    # For robustnes, we check the legacy key commonly associated with it.
    
    # However, a more reliable modern check is often just policy based.
    # HKLM\SOFTWARE\Microsoft\WcmSvc\wifinetworkmanager\config -> AutoConnectAllowedOEM (0)
    
    $val = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WcmSvc\wifinetworkmanager\config" -Name "AutoConnectAllowedOEM" -ErrorAction SilentlyContinue
    
    $isEnabled = ($val.AutoConnectAllowedOEM -eq 0)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "Wi-Fi Sense is disabled." } else { "Wi-Fi Sense is active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    if (!(Test-Path "HKLM:\SOFTWARE\Microsoft\WcmSvc\wifinetworkmanager\config")) {
        New-Item -Path "HKLM:\SOFTWARE\Microsoft\WcmSvc\wifinetworkmanager\config" -Force | Out-Null
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WcmSvc\wifinetworkmanager\config" -Name "AutoConnectAllowedOEM" -Value 0

    return @{ success = $true; message = "Wi-Fi Sense disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WcmSvc\wifinetworkmanager\config" -Name "AutoConnectAllowedOEM" -Value 1

    return @{ success = $true; message = "Wi-Fi Sense restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
