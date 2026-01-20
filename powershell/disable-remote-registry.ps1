param (
    [string]$Action
)

function Get-Status {
    $service = Get-Service -Name "RemoteRegistry" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.StartType -eq 'Disabled' -and $service.Status -eq 'Stopped') {
            return @{ enabled = $true; status = "Safe"; details = "Remote Registry is disabled" }
        }
    }
    return @{ enabled = $false; status = "At Risk"; details = "Remote Registry is enabled" }
}

function Enable-Feature {
    Set-Service -Name "RemoteRegistry" -StartupType Manual -ErrorAction SilentlyContinue
    return Get-Status
}

function Disable-Feature {
    Stop-Service -Name "RemoteRegistry" -Force -ErrorAction SilentlyContinue
    Set-Service -Name "RemoteRegistry" -StartupType Disabled -ErrorAction SilentlyContinue
    return Get-Status
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    Enable-Feature | ConvertTo-Json -Compress
}
elseif ($Action -eq "Disable") {
    Disable-Feature | ConvertTo-Json -Compress
}
