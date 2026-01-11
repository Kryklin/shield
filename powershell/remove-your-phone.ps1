param (
    [string]$Action
)

function Get-Status {
    $val = Get-AppxPackage -Name "*YourPhone*"
    $isHardened = (-not $val)
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "Phone Link is removed." } else { "Phone Link is installed." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Get-AppxPackage -Name "*YourPhone*" | Remove-AppxPackage -ErrorAction SilentlyContinue
    return @{ success = $true; message = "Phone Link removed." } | ConvertTo-Json
}

function Disable-Hardening {
    Get-AppxPackage -AllUsers -Name "*YourPhone*" | ForEach-Object {
        Add-AppxPackage -Register "$($_.InstallLocation)\AppxManifest.xml" -DisableDevelopmentMode -ErrorAction SilentlyContinue
    }
    return @{ success = $true; message = "Attempted to restore Phone Link." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
