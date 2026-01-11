param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search"
$ValueName = "BingSearchEnabled"

function Get-Status {
    if (Test-Path $KeyPath) {
        $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
        if ($val -and $val.$ValueName -eq 0) {
            return @{ enabled = $true; status = "Web Search Disabled" }
        }
    }
    return @{ enabled = $false; status = "Web Search Enabled" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Disable Web Search (Set to 0)
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
    Set-ItemProperty -Path $KeyPath -Name "CortanaConsent" -Value 0 -Type DWord -ErrorAction SilentlyContinue | Out-Null
}
elseif ($Action -eq "Disable") {
    # Enable Web Search (Delete or Set to 1)
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
