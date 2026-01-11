param (
    [string]$Action
)

function Get-Status {
    $apps = Get-AppxPackage -Name "*xbox*"
    $isHardened = ($apps.Count -eq 0)
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "Xbox apps removed." } else { "Xbox apps installed." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Get-AppxPackage -Name "*xbox*" | Remove-AppxPackage -ErrorAction SilentlyContinue
    
    return @{ success = $true; message = "Xbox apps removed." } | ConvertTo-Json
}

function Disable-Hardening {
    # Best effort re-register from manifest
    Get-AppxPackage -AllUsers -Name "*xbox*" | ForEach-Object {
        Add-AppxPackage -Register "$($_.InstallLocation)\AppxManifest.xml" -DisableDevelopmentMode -ErrorAction SilentlyContinue
    }
    
    return @{ success = $true; message = "Attempted to restore Xbox apps." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
