param (
    [string]$Action
)

function Get-Status {
    $val = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Input\TIPC" -Name "Enabled" -ErrorAction SilentlyContinue
    # Also check HKLM policy if possible, but usually user preference.
    
    # 0 = Disabled
    $isEnabled = ($val.Enabled -eq 0)
    
    $status = if ($isEnabled) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isEnabled
        status  = $status
        details = if ($isEnabled) { "Typing Insights are disabled." } else { "Typing Insights are active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    if (!(Test-Path "HKCU:\Software\Microsoft\Input\TIPC")) {
        New-Item -Path "HKCU:\Software\Microsoft\Input\TIPC" -Force | Out-Null
    }
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Input\TIPC" -Name "Enabled" -Value 0

    return @{ success = $true; message = "Typing Insights disabled." } | ConvertTo-Json
}

function Disable-Hardening {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Input\TIPC" -Name "Enabled" -Value 1

    return @{ success = $true; message = "Typing Insights restored." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
