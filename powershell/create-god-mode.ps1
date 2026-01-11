param (
    [string]$Action = "Query"
)

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$GodModeName = "God Mode.{ED7BA470-8E54-465E-825C-99712043E01C}"
$FullPath = Join-Path -Path $DesktopPath -ChildPath $GodModeName

function Get-Status {
    if (Test-Path $FullPath) {
        return @{ enabled = $true; status = "God Mode Active" }
    }
    return @{ enabled = $false; status = "God Mode Hidden" }
}

if ($Action -eq "Query") {
    Get-Status | ConvertTo-Json -Compress
}
elseif ($Action -eq "Enable") {
    if (-not (Test-Path $FullPath)) {
        New-Item -Path $FullPath -ItemType Directory | Out-Null
    }
}
elseif ($Action -eq "Disable") {
    if (Test-Path $FullPath) {
        Remove-Item -Path $FullPath -Force | Out-Null
    }
}
