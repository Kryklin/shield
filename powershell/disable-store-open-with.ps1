param (
    [string]$Action = "Query"
)

$KeyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Explorer"
$ValueName = "NoUseStoreOpenWith"

# 1 = Disable Store Open With

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    $isEnabled = ($val -and $val.$ValueName -eq 1)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }

    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "Store 'Open With' prompt is disabled." } else { "Store 'Open With' prompt is enabled." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
    return @{ success = $true; message = "Store prompt disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    if (Test-Path $KeyPath) {
        Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
    }
    return @{ success = $true; message = "Store prompt restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
