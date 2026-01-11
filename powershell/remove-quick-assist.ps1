param (
    [string]$Action
)

function Get-Status {
    $val = Get-AppxPackage -Name "*QuickAssist*"
    $isHardened = (-not $val)
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "Quick Assist is removed." } else { "Quick Assist is installed." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Get-AppxPackage -Name "*QuickAssist*" | Remove-AppxPackage -ErrorAction SilentlyContinue
    return @{ success = $true; message = "Quick Assist removed." } | ConvertTo-Json
}

function Disable-Hardening {
    Get-AppxPackage -AllUsers -Name "*QuickAssist*" | ForEach-Object {
        Add-AppxPackage -Register "$($_.InstallLocation)\AppxManifest.xml" -DisableDevelopmentMode -ErrorAction SilentlyContinue
    }
    return @{ success = $true; message = "Attempted to restore Quick Assist." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
