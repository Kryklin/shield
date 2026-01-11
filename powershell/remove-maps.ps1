param (
    [string]$Action
)

function Get-Status {
    $val = Get-AppxPackage -Name "*WindowsMaps*"
    $isHardened = (-not $val)
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "Windows Maps is removed." } else { "Windows Maps is installed." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Get-AppxPackage -Name "*WindowsMaps*" | Remove-AppxPackage -ErrorAction SilentlyContinue
    return @{ success = $true; message = "Windows Maps removed." } | ConvertTo-Json
}

function Disable-Hardening {
    Get-AppxPackage -AllUsers -Name "*WindowsMaps*" | ForEach-Object {
        Add-AppxPackage -Register "$($_.InstallLocation)\AppxManifest.xml" -DisableDevelopmentMode -ErrorAction SilentlyContinue
    }
    return @{ success = $true; message = "Attempted to restore Windows Maps." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
