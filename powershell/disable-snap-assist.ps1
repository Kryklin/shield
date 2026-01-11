param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
$ValueName = "SnapAssist"

# 0 = Off (Disabled Feature) -> My text "Disable Snap Assist" Enabled = Value 0
# 1 = On (Enabled Feature)

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($val -and $val.$ValueName -eq 0) {
        return @{ enabled = $true; status = "Snap Assist Disabled" }
    }
    return @{ enabled = $false; status = "Snap Assist Enabled" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Disable Snap Assist (Set to 0)
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
}
elseif ($Action -eq "Disable") {
    # Enable Snap Assist (Set to 1)
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
