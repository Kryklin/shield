param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
$ValueName = "HideFileExt"

# 0 = Show extensions (Enabled feature in my app context means "Show Extensions")
# 1 = Hide extensions (Disabled feature)

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($val -and $val.$ValueName -eq 0) {
        return @{ enabled = $true; status = "Extensions Visible" }
    }
    return @{ enabled = $false; status = "Extensions Hidden" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Show Extensions -> HideFileExt = 0
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
}
elseif ($Action -eq "Disable") {
    # Hide Extensions -> HideFileExt = 1
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
