param (
    [string]$Action
)

$Patterns = @("*3dbuilder*", "*solitaire*", "*mixedreality*", "*feedback*", "*gethelp*", "*tips*")

function Get-Status {
    $count = 0
    foreach ($p in $Patterns) {
        $found = Get-AppxPackage -Name $p
        if ($found) { $count++ }
    }
    
    $isHardened = ($count -eq 0)
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "Basic UWP bloat removed." } else { "Basic UWP bloat installed." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    foreach ($p in $Patterns) {
        Get-AppxPackage -Name $p | Remove-AppxPackage -ErrorAction SilentlyContinue
    }
    return @{ success = $true; message = "Basic UWP bloat removed." } | ConvertTo-Json
}

function Disable-Hardening {
    foreach ($p in $Patterns) {
        Get-AppxPackage -AllUsers -Name $p | ForEach-Object {
            Add-AppxPackage -Register "$($_.InstallLocation)\AppxManifest.xml" -DisableDevelopmentMode -ErrorAction SilentlyContinue
        }
    }
    return @{ success = $true; message = "Attempted to restore Basic UWP bloat." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
