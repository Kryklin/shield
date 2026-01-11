param (
    [string]$Action = "Query"
)

$KeyPath = "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32"
# If key exists, Custom (Classic) menu is ACTIVE.
# If key missing, Default (Win 11) menu is ACTIVE.

function Get-Status {
    if (Test-Path $KeyPath) {
        return @{ enabled = $true; status = "Classic Style" }
    }
    else {
        return @{ enabled = $false; status = "Windows 11 Default" }
    }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Enable Classic (Create Key)
    if (-not (Test-Path $KeyPath)) {
        New-Item -Path $KeyPath -Force | Out-Null
        Set-ItemProperty -Path $KeyPath -Name "(default)" -Value "" | Out-Null
    }
    # Restart Explorer to apply? User might need to, but we won't force it blindly.
}
elseif ($Action -eq "Disable") {
    # Restore Default (Delete Key)
    if (Test-Path "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}") {
        Remove-Item -Path "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" -Recurse -Force | Out-Null
    }
}
