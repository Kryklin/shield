param (
    [string]$Action
)

function Get-Status {
    $val = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Start_TrackProgs" -ErrorAction SilentlyContinue
    
    # Hardening enabled if Start_TrackProgs is 0
    $isEnabled = ($val.Start_TrackProgs -eq 0)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "App launch tracking is disabled." } else { "App launch tracking is active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Start_TrackProgs" -Value 0

    return @{ success = $true; message = "App launch tracking disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Start_TrackProgs" -Value 1

    return @{ success = $true; message = "App launch tracking restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
