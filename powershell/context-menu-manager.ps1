param (
    [string]$Action
)

function Get-State {
    # Check if the "Classic Menu" key exists
    $Path = "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32"
    $IsClassic = Test-Path $Path
    
    return @{
        IsClassic = $IsClassic
    }
}

function Toggle-Classic {
    $Path = "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32"
    $Parent = "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}"
    
    if (Test-Path $Path) {
        # Currently Classic -> Switch to Modern (Delete Key)
        Remove-Item -Path $Parent -Recurse -Force -ErrorAction SilentlyContinue
        return @{ Success = $true; State = "Modern"; Message = "Restored Windows 11 Modern Menu. Explorer restart required." }
    }
    else {
        # Currently Modern -> Switch to Classic (Create Key)
        # We need to create the key and set the (Default) value to empty string specifically
        New-Item -Path $Path -Force | Out-Null
        Set-ItemProperty -Path $Path -Name "(Default)" -Value "" | Out-Null
        
        return @{ Success = $true; State = "Classic"; Message = "Enabled Classic Context Menu. Explorer restart required." }
    }
}

function Restart-Explorer {
    Stop-Process -Name explorer -Force
    return @{ Success = $true }
}

switch ($Action) {
    "GetState" { Get-State }
    "ToggleClassic" { Toggle-Classic }
    "RestartExplorer" { Restart-Explorer }
    default { Write-Error "Unknown Action: $Action" }
}
