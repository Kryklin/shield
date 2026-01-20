param (
    [string]$Action = "Query"
)

$KeyPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"
$ValueName = "VerboseStatus"

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    $isEnabled = ($val -and $val.$ValueName -eq 1)

    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "Verbose messages enabled." } else { "Standard messages only." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
    return @{ success = $true; message = "Verbose status enabled." } | ConvertTo-Json
}

function Disable-Hardening {
    if (Test-Path $KeyPath) {
        Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
    }
    return @{ success = $true; message = "Verbose status disabled." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
