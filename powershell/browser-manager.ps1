param (
    [string]$Action,
    [string]$Browser, # Chrome, Edge, Firefox
    [string]$Policy  # Tracking, Passwords, etc
)

function Set-RegistryValue {
    param ($Path, $Name, $Value, $Type = "DWord")
    if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
    New-ItemProperty -Path $Path -Name $Name -Value $Value -PropertyType $Type -Force | Out-Null
}

function Harden-Chrome {
    # HKLM\SOFTWARE\Policies\Google\Chrome
    $Path = "HKLM:\SOFTWARE\Policies\Google\Chrome"
    
    # 1. Block Third Party Cookies
    Set-RegistryValue -Path $Path -Name "BlockThirdPartyCookies" -Value 1
    
    # 2. Disable Password Manager
    Set-RegistryValue -Path $Path -Name "PasswordManagerEnabled" -Value 0
    
    # 3. Disable Autofill
    Set-RegistryValue -Path $Path -Name "AutofillAddressEnabled" -Value 0
    Set-RegistryValue -Path $Path -Name "AutofillCreditCardEnabled" -Value 0
    
    # 4. Disable Metrics/Telemetry
    Set-RegistryValue -Path $Path -Name "MetricsReportingEnabled" -Value 0
    
    # 5. Force Safe Browsing
    Set-RegistryValue -Path $Path -Name "SafeBrowsingProtectionLevel" -Value 1 # 1 = Standard, 2 = Enhanced
    
    return @{ success = $true; browser = "Chrome"; message = "Chrome hardening policies applied." }
}

function Harden-Edge {
    # HKLM\SOFTWARE\Policies\Microsoft\Edge
    $Path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
    
    # 1. Block Third Party Cookies
    Set-RegistryValue -Path $Path -Name "BlockThirdPartyCookies" -Value 1
    
    # 2. Disable Password Manager
    Set-RegistryValue -Path $Path -Name "PasswordManagerEnabled" -Value 0
    
    # 3. Disable Advertising ID for Edge
    Set-RegistryValue -Path $Path -Name "AadDAudienceEnabled" -Value 0
    
    # 4. Disable Typosquatting protection (which sends urls to MS)
    Set-RegistryValue -Path $Path -Name "PreventTyposquattingHelper" -Value 1
    
    # 5. Disable Shopping Assistant
    Set-RegistryValue -Path $Path -Name "EdgeShoppingAssistantEnabled" -Value 0

    return @{ success = $true; browser = "Edge"; message = "Edge hardening policies applied." }
}

function Harden-Firefox {
    # Firefox uses policies.json usually in install dir, or Registry HKLM\SOFTWARE\Policies\Mozilla\Firefox
    $Path = "HKLM:\SOFTWARE\Policies\Mozilla\Firefox"
    
    # 1. Disable Telemetry
    Set-RegistryValue -Path $Path -Name "DisableTelemetry" -Value 1
    
    # 2. Disable Pocket
    Set-RegistryValue -Path $Path -Name "DisablePocket" -Value 1
    
    # 3. Disable Password Manager
    Set-RegistryValue -Path $Path -Name "PasswordManagerEnabled" -Value 0
    
    # 4. DNS over HTTPS (Force Enable)
    Set-RegistryValue -Path $Path -Name "DNSOverHTTPS" -Value 1
    
    return @{ success = $true; browser = "Firefox"; message = "Firefox hardening policies applied." }
}

if ($Action -eq "Harden") {
    try {
        if ($Browser -eq "Chrome") { Harden-Chrome | ConvertTo-Json -Compress }
        elseif ($Browser -eq "Edge") { Harden-Edge | ConvertTo-Json -Compress }
        elseif ($Browser -eq "Firefox") { Harden-Firefox | ConvertTo-Json -Compress }
        else { throw "Unknown Browser" }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
    }
}
elseif ($Action -eq "CheckStatus") {
    # Quick check if keys exist
    # Simplified for UI responsiveness
    $c = Test-Path "HKLM:\SOFTWARE\Policies\Google\Chrome"
    $e = Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
    $f = Test-Path "HKLM:\SOFTWARE\Policies\Mozilla\Firefox"
    
    return @{ chrome = $c; edge = $e; firefox = $f } | ConvertTo-Json -Compress
}
