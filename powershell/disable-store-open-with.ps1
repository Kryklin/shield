param (
    [string]$Action = "Query"
)

$KeyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Explorer"
$ValueName = "NoUseStoreOpenWith"

# 1 = Disable Store Open With

function Get-Status {
    $val = Get-ItemProperty -Path $KeyPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($val -and $val.$ValueName -eq 1) {
        return @{ enabled = $true; status = "Store Prompt Disabled" }
    }
    return @{ enabled = $false; status = "Store Prompt Enabled" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 1 -Type DWord | Out-Null
}
elseif ($Action -eq "Disable") {
    Set-ItemProperty -Path $KeyPath -Name $ValueName -Value 0 -Type DWord | Out-Null
}
