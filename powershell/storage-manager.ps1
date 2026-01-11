param (
    [string]$Action = "Status",
    [string]$Path = ""
)

function Get-Storage {
    $drives = Get-PSDrive -PSProvider FileSystem
    $results = @()
    foreach ($d in $drives) {
        # Only process drives that have size (filters out empty card readers etc)
        if ($d.Used -ge 0 -or $d.Free -ge 0) {
            $total = $d.Used + $d.Free
            # Avoid divide by zero
            $pFree = 0
            if ($total -gt 0) {
                $pFree = [math]::Round(($d.Free / $total) * 100, 1)
            }
            
            $results += @{
                name        = $d.Name
                description = $d.Description
                root        = $d.Root
                free        = $d.Free
                used        = $d.Used
                total       = $total
                percentFree = $pFree
            }
        }
    }
    return $results
}

if ($Action -eq "Status") {
    Get-Storage | ConvertTo-Json -Compress
}
elseif ($Action -eq "FindLarge") {
    $path = $env:USERPROFILE
    # Limit search depth or specific folders if too slow, but userprofile is usually okay-ish
    # Using a faster approach if possible, but GCI is standard.
    
    $files = Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object Length -gt 100MB | 
    Sort-Object Length -Descending | 
    Select-Object -First 10
             
    $results = @()
    foreach ($f in $files) {
        $results += @{
            name = $f.Name
            path = $f.FullName
            size = [math]::Round($f.Length / 1MB, 2)
        }
    }
    return $results | ConvertTo-Json -Compress
}
elseif ($Action -eq "DeleteFile") {
    if ($Path) {
        Remove-Item -Path $Path -Force -ErrorAction SilentlyContinue
        return @{ success = $true } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "Clean") {
    # 1. Empty Recycle Bin
    Clear-RecycleBin -Force -ErrorAction SilentlyContinue
    
    # 2. Clear Temp
    Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:WINDIR\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
    
    Get-Storage | ConvertTo-Json -Compress
}
elseif ($Action -eq "DeepClean") {
    # Runs the disk cleanup tool with all flags set
    # We can use /sagerun:1 after setting registry keys, or pass specific IDs
    # For user safety, we'll try to automate cleanmgr /LOWDISK which is safer than sagerun
    # OR we can manually delete more aggression:
    # - Windows Update cache (SoftwareDistribution) - REQUIRES STOPPING SERVICE
    # - Prefetch
    
    try {
        # Safe extended cleaning
        Remove-Item "$env:WINDIR\Prefetch\*" -Recurse -Force -ErrorAction SilentlyContinue
        
        # Windows Update Cache (Requires Service Stop)
        Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
        Remove-Item "$env:WINDIR\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Service -Name wuauserv -ErrorAction SilentlyContinue

        return @{ success = $true; message = "Deep cleanup completed (Temp, Prefetch, Update Cache)" } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "ToggleStorageSense") {
    $Path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\StorageSense\Parameters\StoragePolicy"
    
    # Check current state first (01 = On)
    $Current = Get-ItemProperty -Path $Path -Name "01" -ErrorAction SilentlyContinue
    
    if ($Current."01" -eq 1) {
        Set-ItemProperty -Path $Path -Name "01" -Value 0 -ErrorAction SilentlyContinue
        return @{ success = $true; enabled = $false } | ConvertTo-Json -Compress
    }
    else {
        # Ensure key exists
        if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
        Set-ItemProperty -Path $Path -Name "01" -Value 1 -ErrorAction SilentlyContinue
        # Set basic defaults if new
        Set-ItemProperty -Path $Path -Name "2048" -Value 1 -ErrorAction SilentlyContinue # Run when low disk space
        return @{ success = $true; enabled = $true } | ConvertTo-Json -Compress
    }
}
