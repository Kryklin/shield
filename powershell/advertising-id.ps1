param (
    [string]$Action
)

function Get-Status {
    # HKCU disabled check
    $advInfo = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -ErrorAction SilentlyContinue
    
    $isEnabled = ($advInfo.Enabled -eq 0)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "Advertising ID is disabled." } else { "Advertising ID is active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -Value 0 -ErrorAction SilentlyContinue

    return @{ success = $true; message = "Advertising ID disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -Value 1 -ErrorAction SilentlyContinue

    return @{ success = $true; message = "Advertising ID restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
