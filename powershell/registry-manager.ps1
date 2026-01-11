param (
    [string]$Action,
    [string]$Path
)

# Configuration
$BackupDir = "$env:APPDATA\Shield\Backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

function Get-Backups {
    $files = Get-ChildItem -Path $BackupDir -Filter "*.reg" | Sort-Object CreationTime -Descending
    $results = @()
    foreach ($f in $files) {
        $results += @{
            Name     = $f.Name
            FullName = $f.FullName
            Size     = "{0:N2} MB" -f ($f.Length / 1MB)
            Created  = $f.CreationTime.ToString("yyyy-MM-dd HH:mm")
        }
    }
    return $results
}

function Backup-Registry {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $filename = "Backup-$timestamp.reg"
    $filepath = Join-Path $BackupDir $filename
    
    # Exporting HKCU and HKLM\SOFTWARE (User settings + App settings)
    # We use specific keys to avoid full system bloat export, aiming for 'Shield Safe Area'
    # Actually, reg export is blocky. Let's do a combined export of safe areas.
    # For simplicity and speed in this context, we'll export current user hive which contains most tweaks.
    
    # Export HKCU
    & reg export HKEY_CURRENT_USER "$filepath" /y | Out-Null
    
    if (Test-Path $filepath) {
        return @{ Success = $true; Path = $filepath }
    }
    else {
        return @{ Success = $false; Error = "Export failed" }
    }
}

function Restore-Registry {
    param($RestorePath)
    if (-not (Test-Path $RestorePath)) {
        return @{ Success = $false; Error = "File not found" }
    }

    & reg import "$RestorePath" | Out-Null
    return @{ Success = $true }
}

# Dispatcher
switch ($Action) {
    "GetBackups" { Get-Backups }
    "Backup" { Backup-Registry }
    "Restore" { Restore-Registry -RestorePath $Path }
    default { Write-Error "Unknown Action: $Action" }
}
