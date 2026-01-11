$os = Get-CimInstance Win32_OperatingSystem
$cs = Get-CimInstance Win32_ComputerSystem
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
$bios = Get-CimInstance Win32_BIOS
$baseboard = Get-CimInstance Win32_BaseBoard

$mem = [math]::Round($cs.TotalPhysicalMemory / 1GB, 1)
$lastBoot = $os.LastBootUpTime
$uptimeSpan = (Get-Date) - $lastBoot
# Format uptime as "Xd Yh Zm"
$uptime = "{0}d {1}h {2}m" -f $uptimeSpan.Days, $uptimeSpan.Hours, $uptimeSpan.Minutes

$hasBattery = (Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue)
$isLaptop = [bool]$hasBattery

# Get Screen Resolution (Primary)
$res = "Unknown"
if ($gpu.CurrentHorizontalResolution -and $gpu.CurrentVerticalResolution) {
    $res = "{0}x{1}" -f $gpu.CurrentHorizontalResolution, $gpu.CurrentVerticalResolution
}

$props = @{
    OS          = $os.Caption
    OSBuild     = $os.BuildNumber
    Hostname    = $cs.DNSHostName
    CPU         = $cpu.Name
    GPU         = $gpu.Name
    RAM         = "{0:N1} GB" -f ($cs.TotalPhysicalMemory / 1GB)
    Motherboard = $baseboard.Product
    BIOS        = $bios.SMBIOSBIOSVersion
    Display     = $res
    Uptime      = $uptime
    IsLaptop    = $isLaptop
}

# Ensure Output is JSON for the app to parse
$props | ConvertTo-Json -Compress
