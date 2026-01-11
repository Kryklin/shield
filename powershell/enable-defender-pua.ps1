param (
    [string]$Action
)

function Get-Status {
    $val = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\MpEngine" -Name "MpEnablePus" -ErrorAction SilentlyContinue
    
    # 1 = Enabled
    $isEnabled = ($val.MpEnablePus -eq 1)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "PUA Protection is enabled." } else { "PUA Protection is disabled." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    if (!(Test-Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\MpEngine")) {
        New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\MpEngine" -Force | Out-Null
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\MpEngine" -Name "MpEnablePus" -Value 1

    return @{ success = $true; message = "PUA Protection enabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\MpEngine" -Name "MpEnablePus" -Value 0

    return @{ success = $true; message = "PUA Protection disabled." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
