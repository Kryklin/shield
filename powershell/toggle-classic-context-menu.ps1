param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32"
# If key exists, Custom (Classic) menu is ACTIVE.
# If key missing, Default (Win 11) menu is ACTIVE.

function Get-Status {
    if (Test-Path $KeyPath) {
        return @{ 
            enabled = $true 
            status  = "Safe"
            details = "Classic Context Menu is active." 
        } | ConvertTo-Json
    }
    else {
        return @{ 
            enabled = $false 
            status  = "At Risk" 
            details = "Windows 11 Default Menu is active."
        } | ConvertTo-Json
    }
}

function Enable-Hardening {
    if (-not (Test-Path $KeyPath)) {
        New-Item -Path $KeyPath -Force | Out-Null
        Set-ItemProperty -Path $KeyPath -Name "(default)" -Value "" | Out-Null
    }
    return @{ success = $true; message = "Classic Context Menu enabled." } | ConvertTo-Json
}

function Disable-Hardening {
    if (Test-Path "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}") {
        Remove-Item -Path "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" -Recurse -Force | Out-Null
    }
    return @{ success = $true; message = "Default Context Menu restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
