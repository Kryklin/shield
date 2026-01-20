param (
    [string]$Action
)

function Get-Status {
    $feature = Get-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2 -ErrorAction SilentlyContinue
    # Only check the main feature. Root is implicitly handled.
    
    $isEnabled = ($feature.State -eq "Disabled")
    
    # Double check if feature query failed (e.g. not present on system) -> Consider it disabled/safe
    if (-not $feature) { $isEnabled = $true }
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "PowerShell v2 is disabled." } else { "PowerShell v2 is available." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Disable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2 -NoRestart
    Disable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2Root -NoRestart

    return @{ success = $true; message = "PowerShell v2 disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Enable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2Root -NoRestart
    Enable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2 -NoRestart

    return @{ success = $true; message = "PowerShell v2 enabled." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
