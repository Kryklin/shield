param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
$ValueName = "Hidden"

# 1 = Show hidden files
# 2 = Do not show hidden files
# My App "Enable" = Show Hidden Files

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($val -and $val.$ValueName -eq 1) {
        return @{ enabled = $true; status = "Hidden Files Visible" }
    }
    return @{ enabled = $false; status = "Hidden Files Masked" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Show -> Hidden = 1
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
elseif ($Action -eq "Disable") {
    # Hide -> Hidden = 2
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 2 -Type DWord | Out-Null
}
