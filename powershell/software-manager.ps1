param (
    [string]$Action,
    [string]$Query,
    [string]$Id,
    [string]$Version
)

# Helper to parse Winget Table Output manually since -o json is not always reliable/available
function Convert-WingetOutput {
    param([array]$Output)
    
    $items = @()
    # Skip header and separator lines usually (Name, Id, Version...)
    # We look for the line starting with "Name" and the one with "----"
    
    $startIdx = 0
    for ($i = 0; $i -lt $Output.Count; $i++) {
        if ($Output[$i] -match "^Name\s+Id\s+Version") {
            $startIdx = $i + 2 # Skip header and dashes
            break
        }
    }

    # If we didn't find standard headers, it might be empty or error, but let's try to parse meaningful lines
    # A simple regex approach is often better for 'Name (space) Id (space) Version'
    # Line format: Name <spaces> Id <spaces> Version <spaces> ...
    
    # Actually, recent winget versions have pretty consistent columns.
    # Let's try to just capture the Id which is usually the second column if we split by multiple spaces.
    # But names can have spaces.
    # Strategy: The ID looks like 'Vendor.App'.
    
    for ($i = $startIdx; $i -lt $Output.Count; $i++) {
        $line = $Output[$i].Trim()
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        
        # Heuristic parse: Last column is Source (usually), 2nd to last is Available, 3rd to last is Version... hard to guess.
        # Let's use a regex that assumes the ID is in the middle and looks like 'Word.Word' (roughly).
        # Actually, let's just use a simple regex for the whole line.
        # Format: Name (variable) | Id (variable) | Version (variable) | ...
        # It is really hard to parse perfectly without distinct separators.
        
        # Improved Strategy: use `winget list --accept-source-agreements`
        # and minimal parsing.
        
        # Regex: ^(Name) \s+ (Id) \s+ (Version) ...
        # We can try to match the ID pattern.
        
        if ($line -match "^(.+?)\s+([a-zA-Z0-9\.\-_]+)\s+([0-9\.]+.*?)(\s+\w+)?$") {
            $items += @{
                Name    = $matches[1].Trim()
                Id      = $matches[2].Trim()
                Version = $matches[3].Trim()
            }
        }
    }
    return $items
}

if ($Action -eq "ListInstalled") {
    # List installed packages
    # --accept-source-agreements is crucial
    try {
        $raw = winget list --accept-source-agreements 2>&1
        # Parse it
        # We will try a simpler CSV strategy if available or just raw parse
        # Since I cannot guarantee `winget` version on user machine, I will return raw lines for UI to potentially parse or show 
        # BUT the user wants a nice UI.
        
        # Let's try to get objects.
        # Fallback: Just return the raw text lines if parsing fails? No, UI needs structure.
        
        # Let's try to locate the columns.
        $lines = $raw | Out-String -Stream
        $parsed = Convert-WingetOutput -Output $lines
        
        # Fallback if my regex fails: return a simple object with Name=Line
        if ($parsed.Count -eq 0 -and $lines.Count -gt 5) {
            $parsed = $lines | Select-Object @{Name = "Name"; Expression = { $_ } }
        }
        
        return @{ success = $true; items = $parsed } | ConvertTo-Json -Depth 5 -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "Search") {
    try {
        if (-not $Query) { throw "Query required" }
        $raw = winget search $Query --accept-source-agreements 2>&1
        $lines = $raw | Out-String -Stream
        $parsed = Convert-WingetOutput -Output $lines
        return @{ success = $true; items = $parsed } | ConvertTo-Json -Depth 5 -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "Install") {
    try {
        if (-not $Id) { throw "Id required" }
        # cmd /c ensures we run it properly, potentially
        # --silent is important, but winget installation usually requires some interaction or progress bars
        # which we can't show easily. We'll try --silent --accept-package-agreements
        
        $proc = Start-Process winget -ArgumentList "install --id $Id --silent --accept-package-agreements --accept-source-agreements" -PassThru -Wait -NoNewWindow
        
        if ($proc.ExitCode -eq 0) {
            return @{ success = $true; message = "Installation successful" } | ConvertTo-Json -Compress
        }
        else {
            return @{ success = $false; error = "Exit Code: $($proc.ExitCode)" } | ConvertTo-Json -Compress
        }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "Uninstall") {
    try {
        if (-not $Id) { throw "Id required" }
        $proc = Start-Process winget -ArgumentList "uninstall --id $Id --silent --accept-source-agreements" -PassThru -Wait -NoNewWindow
        if ($proc.ExitCode -eq 0) {
            return @{ success = $true; message = "Uninstallation successful" } | ConvertTo-Json -Compress
        }
        else {
            return @{ success = $false; error = "Exit Code: $($proc.ExitCode)" } | ConvertTo-Json -Compress
        }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "UpgradeAll") {
    try {
        # Check for upgrades
        Start-Process winget -ArgumentList "upgrade --all --silent --accept-package-agreements --accept-source-agreements" -Wait -NoNewWindow
        return @{ success = $true } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    } 
}
