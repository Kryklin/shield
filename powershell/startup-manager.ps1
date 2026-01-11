param (
    [string]$Action = "GetStartup",
    [string]$Name = "",
    [string]$Location = ""
)

function Get-StartupItems {
    $results = @()
    # 1. Registry HKLM Run
    $hklm = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
    if (Test-Path $hklm) {
        Get-Item $hklm | Select-Object -ExpandProperty Property | ForEach-Object {
            $val = Get-ItemProperty -Path $hklm -Name $_
            $results += @{ Name = $_; Command = $val.$_; Location = "HKLM Registry"; Path = $hklm }
        }
    }
    
    # 2. Registry HKCU Run
    $hkcu = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    if (Test-Path $hkcu) {
        Get-Item $hkcu | Select-Object -ExpandProperty Property | ForEach-Object {
            $val = Get-ItemProperty -Path $hkcu -Name $_
            $results += @{ Name = $_; Command = $val.$_; Location = "HKCU Registry"; Path = $hkcu }
        }
    }

    # 3. Startup Folder (User)
    $startup = [Environment]::GetFolderPath("Startup")
    if (Test-Path $startup) {
        Get-ChildItem -Path $startup -Filter "*.lnk" | ForEach-Object {
            $results += @{ Name = $_.BaseName; Command = $_.FullName; Location = "Startup Folder"; Path = $startup }
        }
    }

    return $results
}

if ($Action -eq "GetStartup") {
    Get-StartupItems | ConvertTo-Json -Compress
}
elseif ($Action -eq "Remove") {
    if ($Name -and $Location) {
        if ($Location -match "Registry") {
            # Registry Delete
            $key = if ($Location -match "HKLM") { "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" } else { "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" }
            Remove-ItemProperty -Path $key -Name $Name -ErrorAction SilentlyContinue
        }
        else {
            # File Delete (Startup Folder)
            $path = Join-Path -Path [Environment]::GetFolderPath("Startup") -ChildPath "$Name.lnk"
            if (Test-Path $path) { Remove-Item -Path $path -Force }
        }
        Get-StartupItems | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "Add") {
    if ($Name -and $Location) {
        # Location here is actually the Target Path for the shortcut
        $targetPath = $Location 
        $shortcutPath = Join-Path -Path [Environment]::GetFolderPath("Startup") -ChildPath "$Name.lnk"
        
        try {
            $wsh = New-Object -ComObject WScript.Shell
            $shortcut = $wsh.CreateShortcut($shortcutPath)
            $shortcut.TargetPath = $targetPath
            $shortcut.Save()
            return @{ success = $true } | ConvertTo-Json -Compress
        }
        catch {
            return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
        }
    }
}
elseif ($Action -eq "AddDelayed") {
    if ($Name -and $Location) {
        # Using Scheduled Task for delay
        # Requires Admin
        $Action = New-ScheduledTaskAction -Execute $Location
        $Trigger = New-ScheduledTaskTrigger -AtLogOn
        $Trigger.Delay = 'PT30S' # 30 Second Delay
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0
        
        try {
            Register-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -TaskName "ShieldStartup_$Name" -Description "Delayed Startup by Shield" -Force | Out-Null
            return @{ success = $true } | ConvertTo-Json -Compress
        }
        catch {
            return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
        }
    }
}
