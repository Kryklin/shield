param (
    [string]$Action = "Query"
)

$KeyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization"
$ValueName = "NoLockScreen"

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($val -and $val.$ValueName -eq 1) {
        return @{ enabled = $true; status = "Lock Screen Disabled" }
    }
    return @{ enabled = $false; status = "Lock Screen Enabled" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Disable Lock Screen (NoLockScreen = 1)
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
elseif ($Action -eq "Disable") {
    # Enable Lock Screen (Delete key or set to 0)
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
}
