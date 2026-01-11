param (
    [string]$Action
)

function Get-Status {
    $val = Get-AppxPackage -Name "*Cortana*"
    $isHardened = (-not $val)
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "Cortana app is removed." } else { "Cortana app is installed." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Get-AppxPackage -Name "*Cortana*" | Remove-AppxPackage -ErrorAction SilentlyContinue
    return @{ success = $true; message = "Cortana app removed." } | ConvertTo-Json
}

function Disable-Hardening {
    Get-AppxPackage -AllUsers -Name "*Cortana*" | ForEach-Object {
        Add-AppxPackage -Register "$($_.InstallLocation)\AppxManifest.xml" -DisableDevelopmentMode -ErrorAction SilentlyContinue
    }
    return @{ success = $true; message = "Attempted to restore Cortana app." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
