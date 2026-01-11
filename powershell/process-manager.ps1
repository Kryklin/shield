param (
    [string]$Action,
    [int]$Id
)

function Get-Processes {
    # Get processes, sort by CPU usage (approximate), and select relevant properties
    # Note: CPU usage is instantaneous and might be 0 for many. Sorting by WorkingSet (Memory) is also useful.
    # We'll return top 50 to avoid lagging the UI with thousands of processes.
    
    $procs = Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 50
    
    $results = @()
    foreach ($p in $procs) {
        $results += @{
            Id          = $p.Id
            Name        = $p.ProcessName
            Memory      = "{0:N0} MB" -f ($p.WorkingSet / 1MB)
            Title       = $p.MainWindowTitle
            Description = try { $p.Description } catch { "" }
        }
    }
    return $results
}

function Stop-TargetProcess {
    param($TargetId)
    try {
        Stop-Process -Id $TargetId -Force -ErrorAction Stop
        return @{ Success = $true }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

switch ($Action) {
    "GetProcesses" { Get-Processes }
    "Kill" { Stop-TargetProcess -TargetId $Id }
    default { Write-Error "Unknown Action: $Action" }
}
