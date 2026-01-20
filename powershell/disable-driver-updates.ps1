param (
    [string]$Action = "Query"
)

$KeyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
$ValueName = "ExcludeWUDriversInQualityUpdate"

# 1 = Exclude Drivers (Enabled Feature)

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    # 1 = Exclude Drivers (Enabled Feature / Hardened)
    $isEnabled = ($val -and $val.$ValueName -eq 1)

    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "Driver updates are frozen." } else { "Driver updates are active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
    return @{ success = $true; message = "Driver updates frozen." } | ConvertTo-Json
}

function Disable-Hardening {
    # Set to 0 (Include drivers)
    if (Test-Path $KeyPath) {
        Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
    }
    return @{ success = $true; message = "Driver updates restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
