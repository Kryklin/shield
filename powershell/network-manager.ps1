param (
    [string]$Action = "GetAdapters",
    [string]$AdapterIndex = "",
    [string]$DNS1 = "",
    [string]$DNS2 = ""
)

function Get-Adapters {
    $adapters = Get-NetAdapter -Physical | Where-Object Status -eq "Up"
    $results = @()

    foreach ($nic in $adapters) {
        $stats = Get-NetAdapterStatistics -Name $nic.Name
        $ip = Get-NetIPAddress -InterfaceIndex $nic.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
        $dns = Get-DnsClientServerAddress -InterfaceIndex $nic.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue

        $results += @{
            index         = $nic.InterfaceIndex
            name          = $nic.Name
            description   = $nic.InterfaceDescription
            mac           = $nic.MacAddress
            status        = $nic.Status
            linkSpeed     = $nic.LinkSpeed
            ip            = if ($ip) { $ip.IPAddress } else { "N/A" }
            dns           = if ($dns) { $dns.ServerAddresses -join ", " } else { "Automatic" }
            bytesSent     = $stats.SentBytes
            bytesReceived = $stats.ReceivedBytes
        }
    }
    return $results
}

if ($Action -eq "GetAdapters") {
    Get-Adapters | ConvertTo-Json -Compress
}
elseif ($Action -eq "SetDNS") {
    if ($AdapterIndex) {
        $servers = @()
        if ($DNS1) { $servers += $DNS1 }
        if ($DNS2) { $servers += $DNS2 }

        if ($servers.Count -gt 0) {
            Set-DnsClientServerAddress -InterfaceIndex $AdapterIndex -ServerAddresses $servers -ErrorAction Stop
        }
        else {
            Set-DnsClientServerAddress -InterfaceIndex $AdapterIndex -ResetServerAddresses -ErrorAction Stop
        }
        Get-Adapters | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "GetPublicIP") {
    try {
        $ip = Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 2
        return @{ ip = $ip } | ConvertTo-Json -Compress
    }
    catch {
        return @{ ip = "Unavailable" } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "TestLatency") {
    try {
        $ping = Test-Connection -ComputerName "1.1.1.1" -Count 1 -ErrorAction Stop
        return @{ latency = $ping.ResponseTime } | ConvertTo-Json -Compress
    }
    catch {
        return @{ latency = -1 } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "Repair") {
    try {
        ipconfig /flushdns | Out-Null
        ipconfig /release | Out-Null
        ipconfig /renew | Out-Null
        netsh winsock reset | Out-Null
        netsh int ip reset | Out-Null
        
        return @{ success = $true; message = "Network Stack Reset. Reboot Recommended." } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "UpdateHosts") {
    $HostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    $BackupPath = "$HostsPath.bak"
    $Url = "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"

    try {
        # Backup
        if (Test-Path $HostsPath) {
            Copy-Item $HostsPath $BackupPath -Force
        }

        # Download and Apply
        $webClient = New-Object System.Net.WebClient
        $content = $webClient.DownloadString($Url)
        Set-Content -Path $HostsPath -Value $content -Force

        return @{ success = $true; message = "Hosts file updated successfully." } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "ResetHosts") {
    $HostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    $DefaultContent = @"
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host
#
# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost
"@

    try {
        Set-Content -Path $HostsPath -Value $DefaultContent -Force
        return @{ success = $true; message = "Hosts file reset to default." } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "SetMacAddress") {
    # Params: $AdapterIndex, $Mac (Optional, if empty = Random)
    if ($AdapterIndex) {
        try {
            $nic = Get-NetAdapter -InterfaceIndex $AdapterIndex
            if (-not $nic) { throw "Adapter not found" }
            
            # Generate Random MAC if not provided
            if (-not $Mac) {
                $bytes = 0..5 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }
                # Ensure unicast and locally administered (x2, x6, xA, xE)
                # Second nibble must be 2, 6, A, or E
                $bytes[0] = $bytes[0] -band 254 # Clear multicast bit
                $bytes[0] = $bytes[0] -bor 2    # Set local bit
                $Mac = ($bytes | ForEach-Object { "{0:X2}" -f $_ }) -join ""
            }
            
            # Use registry to set NetworkAddress
            $path = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e972-e325-11ce-bfc1-08002be10318}\$($nic.InterfaceIndex.ToString('0000'))"
            
            if (Test-Path $path) {
                Set-ItemProperty -Path $path -Name "NetworkAddress" -Value $Mac
                
                # Restart Adapter to apply
                Restart-NetAdapter -Name $nic.Name -ErrorAction SilentlyContinue
                
                return @{ success = $true; mac = $Mac } | ConvertTo-Json -Compress
            }
            else {
                throw "Registry path not found"
            }
        }
        catch {
            return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
        }
    }
}
elseif ($Action -eq "ResetMacAddress") {
    if ($AdapterIndex) {
        try {
            $nic = Get-NetAdapter -InterfaceIndex $AdapterIndex
            $path = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e972-e325-11ce-bfc1-08002be10318}\$($nic.InterfaceIndex.ToString('0000'))"
            
            if (Test-Path $path) {
                Remove-ItemProperty -Path $path -Name "NetworkAddress" -ErrorAction SilentlyContinue
                Restart-NetAdapter -Name $nic.Name -ErrorAction SilentlyContinue
                return @{ success = $true } | ConvertTo-Json -Compress
            }
        }
        catch {
            return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
        }
    }
}
elseif ($Action -eq "PingTest") {
    # Continuous ping simulation (returns 5 pings)
    # real-time ping requires stream, here we just sample
    try {
        $r = Test-Connection -ComputerName "8.8.8.8" -Count 5
        $avg = ($r | Measure-Object -Property ResponseTime -Average).Average
        return @{ success = $true; average = $avg; min = ($r | Measure-Object -Property ResponseTime -Minimum).Minimum; max = ($r | Measure-Object -Property ResponseTime -Maximum).Maximum } | ConvertTo-Json -Compress
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
