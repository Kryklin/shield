param (
    [string]$Action
)

function Get-Status {
    # Check if SMB1 feature is present
    $smb1 = Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -ErrorAction SilentlyContinue
    
    $isEnabled = ($smb1.State -eq "Disabled")
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "SMBv1 is disabled." } else { "SMBv1 is active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

    return @{ success = $true; message = "SMBv1 disabled (restart may be required)." } | ConvertTo-Json
}

function Disable-Hardening {
    Enable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

    return @{ success = $true; message = "SMBv1 enable (restart may be required)." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
