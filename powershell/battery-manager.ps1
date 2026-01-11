param (
    [string]$Action = "Status",
    [string]$PlanGuid = "",
    [string]$Path = ""
)

function Get-BatteryStatus {
    $battery = Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue
    if (-not $battery) { return @{ error = "No battery detected" } }
    
    # DesignCapacity is technically available in refined WMI or needs report parsing, 
    # but exact health % is tricky in raw WMI. 
    # Win32_Battery has 'DesignCapacity' in newer Windows but sometimes fails.
    # We will try to rely on simple 'EstimatedChargeRemaining' for now.
    # For Power Plans, we parse powercfg.
    
    $plans = powercfg /list | Out-String
    $parsedPlans = @()
    $activePlan = ""

    $plans -split "`n" | ForEach-Object {
        if ($_ -match "GUID:\s+([a-f0-9-]+)\s+\((.+)\)") {
            $guid = $matches[1]
            $name = $matches[2]
            $isActive = $_ -match "\*"
            if ($isActive) { $activePlan = $guid }
            
            $parsedPlans += @{
                id     = $guid
                name   = $name
                active = $isActive
            }
        }
    }

    return @{
        percentage = $battery.EstimatedChargeRemaining
        status     = $battery.BatteryStatus # 1=Draining, 2=AC, etc. (Simplified)
        isCharging = ($battery.BatteryStatus -eq 2)
        runtime    = $battery.EstimatedRunTime # Minutes
        plans      = $parsedPlans
    }
}

if ($Action -eq "Status") {
    Get-BatteryStatus | ConvertTo-Json -Compress
}
elseif ($Action -eq "SetPlan") {
    if ($PlanGuid) {
        powercfg /setactive $PlanGuid
        Get-BatteryStatus | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "UnlockUltimate") {
    # GUID for Ultimate Performance
    powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 33333333-3333-3333-3333-333333333333 | Out-Null
    powercfg /changename 33333333-3333-3333-3333-333333333333 "Ultimate Performance" | Out-Null
    # Refresh list
    Get-BatteryStatus | ConvertTo-Json -Compress
}
elseif ($Action -eq "ImportPlan") {
    if ($Path) {
        powercfg -import $Path | Out-Null
        Get-BatteryStatus | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "GetDetailedReport") {
    $tempFile = "$env:TEMP\battery_report_$([guid]::NewGuid()).xml"
    
    try {
        # Generate XML report
        powercfg /batteryreport /xml /output $tempFile | Out-Null
        
        if (Test-Path $tempFile) {
            [xml]$xml = Get-Content $tempFile
            $battery = $xml.BatteryReport.Batteries.Battery
            
            # Use the first battery found
            if ($battery) {
                # Handle potential array if multiple batteries
                if ($battery -is [array]) { $battery = $battery[0] }

                $design = [int64]$battery.DesignCapacity
                $full = [int64]$battery.FullChargeCapacity
                $cycles = [int64]$battery.CycleCount
                
                # New Exhaustive Fields
                $manufacturer = $battery.Manufacturer
                $serial = $battery.SerialNumber
                $chemistry = $battery.Chemistry
                $sbmn = $battery.SbdsManufactureDate # Often null, but try

                $wear = 0
                if ($design -gt 0) {
                    $wear = 100 - (($full / $design) * 100)
                }

                $result = @{
                    manufacturer       = $manufacturer
                    serialNumber       = $serial
                    chemistry          = $chemistry
                    designCapacity     = $design
                    fullChargeCapacity = $full
                    cycleCount         = $cycles
                    wearLevel          = "{0:N1}" -f $wear
                    success            = $true
                }
            }
            else {
                $result = @{ success = $false; error = "No battery data found in report" }
            }
            
            Remove-Item $tempFile -Force
            return $result | ConvertTo-Json -Compress
        }
        else {
            return @{ success = $false; error = "Failed to generate report" } | ConvertTo-Json -Compress
        }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "Report") {
    $path = "$env:USERPROFILE\Desktop\battery-report.html"
    try {
        powercfg /batteryreport /output "$path" | Out-Null
        return @{ path = $path; success = $true } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "SleepStudy") {
    $tempFile = "$env:TEMP\sleep_study_$([guid]::NewGuid()).xml"
    
    try {
        powercfg /sleepstudy /xml /output "$tempFile" | Out-Null
        
        if (Test-Path $tempFile) {
            [xml]$xml = Get-Content $tempFile
            $sessions = $xml.SleepStudyReport.Session
            
            $results = @()
            # Parse last 5 sessions
            $sessions | Select-Object -Last 5 | ForEach-Object {
                 $results += @{
                    StartTime = $_.StartTime
                    Duration = $_.Duration
                    EnergyChange = $_.EnergyChange
                    Scenario = $_.ScenarioInstance.Scenario
                 }
            }
            
            Remove-Item $tempFile -Force
            return $results | ConvertTo-Json -Compress
        }
        else {
            return @{ success = $false; error = "Failed to generate sleep study" } | ConvertTo-Json -Compress
        }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
