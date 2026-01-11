param (
    [string]$Action = "Query"
)

# 3D Objects CLSID
$CLSID = "{0DB7E03F-FC29-4DC6-9020-FF41B59E513A}"
$Path64 = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\MyComputer\NameSpace\$CLSID"
$Path32 = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Explorer\MyComputer\NameSpace\$CLSID"

function Get-Status {
    # If keys are missing, it's removed (Enabled)
    if ((-not (Test-Path $Path64)) -and (-not (Test-Path $Path32))) {
        return @{ enabled = $true; status = "Hidden" }
    }
    return @{ enabled = $false; status = "Visible" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    # Hide (Remove Keys)
    Remove-Item -Path $Path64 -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $Path32 -Recurse -Force -ErrorAction SilentlyContinue
}
elseif ($Action -eq "Disable") {
    # Show (Recreate Keys)
    # This is tricky because we need the default value. 
    # For now, we assume if user wants it back they might need to repair, 
    # OR we just re-add the key with empty default value which usually triggers Explorer to re-register.
    New-Item -Path $Path64 -Force | Out-Null
    New-Item -Path $Path32 -Force | Out-Null
}
