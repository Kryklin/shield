param (
    [string]$Action
)

function Start-Tool {
    param([string]$Path, [string]$Arguments = "")
    try {
        Start-Process -FilePath $Path -ArgumentList $Arguments -Verb RunAs -ErrorAction Stop
        return @{ success = $true; message = "Launched $Path" } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}

if ($Action -eq "Registry") {
    Start-Tool "regedit.exe"
}
elseif ($Action -eq "GroupPolicy") {
    Start-Tool "mmc.exe" "gpedit.msc"
}
elseif ($Action -eq "TaskMgr") {
    Start-Tool "taskmgr.exe"
}
elseif ($Action -eq "ControlPanel") {
    Start-Tool "control.exe"
}
elseif ($Action -eq "CommandPrompt") {
    Start-Tool "cmd.exe"
}
elseif ($Action -eq "PowerShell") {
    Start-Tool "powershell.exe"
}
elseif ($Action -eq "Services") {
    Start-Tool "mmc.exe" "services.msc"
}
elseif ($Action -eq "GodMode") {
    # Create God Mode Folder on Desktop
    $DesktopPath = [Environment]::GetFolderPath("Desktop")
    $GodModePath = "$DesktopPath\GodMode.{ED7BA470-8E54-465E-825C-99712043E01C}"
    
    try {
        if (-not (Test-Path $GodModePath)) {
            New-Item -Path $GodModePath -ItemType Directory -Force | Out-Null
            return @{ success = $true; message = "God Mode created on Desktop" } | ConvertTo-Json -Compress
        }
        else {
            return @{ success = $true; message = "God Mode already exists" } | ConvertTo-Json -Compress
        }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
