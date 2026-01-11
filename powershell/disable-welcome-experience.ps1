param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager"
$ValueName = "SubscribedContent-310093Enabled"

# 0 = Off (No Welcome) -> My App Enabled (Action) = Value 0
# 1 = On

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($val -and $val.$ValueName -eq 0) {
        return @{ enabled = $true; status = "Nags Disabled" }
    }
    return @{ enabled = $false; status = "Nags Enabled" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Disable Welcome (Set to 0)
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
    Set-ItemProperty -Path $KeyPath -Name "SubscribedContent-338387Enabled" -Value 0 -Type DWord -ErrorAction SilentlyContinue | Out-Null 
}
elseif ($Action -eq "Disable") {
    # Enable Welcome (Set to 1)
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
