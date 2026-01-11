param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
$ValueName = "DisallowShaking"

# 1 = Disable Shake (My App Enable = Disable Shake feature)
# 0 = Enable Shake

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($val -and $val.$ValueName -eq 1) {
        return @{ enabled = $true; status = "Shake Disabled" }
    }
    return @{ enabled = $false; status = "Shake Enabled" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Disable Shake -> DisallowShaking = 1
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
elseif ($Action -eq "Disable") {
    # Enable Shake -> DisallowShaking = 0
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
}
