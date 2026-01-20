param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search"
$ValueName = "BingSearchEnabled"

function Get-Status {
    $isHardened = $false
    if (Test-Path $KeyPath) {
        $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
        # If BingSearchEnabled is 0, it is Hardened (Safe)
        if ($val -and $val.$ValueName -eq 0) {
            $isHardened = $true
        }
    }
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }

    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "Web Search is disabled." } else { "Web Search is enabled." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
    Set-ItemProperty -Path $KeyPath -Name "CortanaConsent" -Value 0 -Type DWord -ErrorAction SilentlyContinue | Out-Null
    return @{ success = $true; message = "Web Search disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
    return @{ success = $true; message = "Web Search enabled." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
