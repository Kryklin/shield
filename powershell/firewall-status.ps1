function Get-FirewallStatus {
    $profiles = Get-NetFirewallProfile
    $status = @()
    foreach ($profile in $profiles) {
        $status += @{
            Name = $profile.Name
            Enabled = [bool]$profile.Enabled
        }
    }
    return $status | ConvertTo-Json
}

Get-FirewallStatus
