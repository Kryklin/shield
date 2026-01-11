param (
    [string]$Action
)

function Get-Status {
    # NetBIOS setting is per-adapter in HKLM\SYSTEM\CurrentControlSet\Services\NetBT\Parameters\Interfaces\
    # However, a global check isn't straightforward in registry alone without iterating.
    # WMSC uses wmic nicconfig call MethodParameters
    
    # We will check if the service is running or if the global registry override is set (if applicable), 
    # but the most effective way is typically iterating adapters.
    # For simplicity/speed in this context, we'll check if the main NetBT service start type is disabled, 
    # OR if we've flagged it via a custom marker, but let's try to query an adapter.
    
    # Actually, simpler: Check if the "NetBIOS over TCP/IP" service is running? No, it's a driver.
    
    # Let's rely on a known registry toggle we use for "Enable-Hardening".
    # We'll use the 'Tcpip\Parameters' 'DisableNetbiosOverTcpip' if it exists, though that might not affect all adapters.
    # A standard approach is setting 'HKLM:SYSTEM\CurrentControlSet\Services\NetBT\Parameters' -> NoNameReleaseOnDemand
    
    # Better approach for this script: We'll check the majority of adapters via WMI/CIM.
    
    try {
        $wmi = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "TcpipNetbiosOptions != 2"
        $isHardened = ($wmi.Count -eq 0) # If count is 0, all are 2 (Disabled)
    }
    catch {
        $isHardened = $false
    }
    
    $status = if ($isHardened) { "Safe" } else { "At Risk" }
    
    return @{
        enabled = $isHardened
        status  = $status
        details = if ($isHardened) { "NetBIOS is disabled." } else { "NetBIOS is active." }
    } | ConvertTo-Json
}

function Enable-Hardening {
    # Disable on all adapters
    $adapters = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled = 'True'"
    foreach ($adapter in $adapters) {
        $adapter.SetTcpipNetbios(2) | Out-Null # 2 = Disabled
    }

    return @{ success = $true; message = "NetBIOS disabled on active adapters." } | ConvertTo-Json
}

function Disable-Hardening {
    # Default (0 = Use DHCP setting)
    $adapters = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled = 'True'"
    foreach ($adapter in $adapters) {
        $adapter.SetTcpipNetbios(0) | Out-Null
    }

    return @{ success = $true; message = "NetBIOS restored to DHCP default." } | ConvertTo-Json
}

switch ($Action) {
    "Query" { Get-Status }
    "Enable" { Enable-Hardening }
    "Disable" { Disable-Hardening }
    default { Get-Status }
}
