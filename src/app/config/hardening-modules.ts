import { HardeningModule } from '../services/hardening.service';

export const HARDENING_MODULES: HardeningModule[] = [
    // Core
    { 
      id: 'telemetry', 
      name: 'Disable System Telemetry', 
      description: 'Prevents Windows from sending diagnostic data to Microsoft.',
      extendedDescription: 'Disables the "Connected User Experiences and Telemetry" service (DiagTrack) and sets the AllowTelemetry registry key to 0. \n\n**Visible Effects:** You will no longer be asked to send feedback to Microsoft. "Feedback & Diagnostics" settings in Windows will be disabled/locked by organization policy. No functional impact on daily use.',
      script: 'system-telemetry',
      state: undefined,
      loading: true 
    },
    { 
      id: 'location', 
      name: 'Disable Location Services', 
      description: 'Blocks applications from accessing precise geolocation data.',
      extendedDescription: 'Disables the Windows Location Service (lfsvc) and prevents apps from querying the location API. \n\n**Visible Effects:** Maps, Weather, and Browser sites will not be able to auto-detect your location. You must manually enter locations for weather or directions. Crucial for privacy.',
      script: 'windows-location',
      state: undefined,
      loading: true
    },
    { 
      id: 'advertising', 
      name: 'Disable Advertising ID', 
      description: 'Prevents apps from using your ID for targeted ads.',
      extendedDescription: 'Resets and disables the unique Advertising ID used by UWP apps to track usage across applications. \n\n**Visible Effects:** No visible change to the system. In-app ads (if any) will become generic and less relevant to your browsing habits. Preventing cross-app tracking.',
      script: 'advertising-id',
      state: undefined,
      loading: true
    },
    // Privacy & Data
    { 
      id: 'cortana', 
      name: 'Disable Cortana', 
      description: 'Disables the Cortana voice assistant and search integration.',
      extendedDescription: 'Sets the "AllowCortana" policy to 0 via Registry. \n\n**Visible Effects:** The Cortana icon will be hidden or non-functional. Voice activation ("Hey Cortana") will stop working. Standard Windows Search will continue to function but without the AI assistant features.',
      script: 'disable-cortana',
      state: undefined,
      loading: true
    },
    { 
      id: 'activity-history', 
      name: 'Disable Activity History', 
      description: 'Stops Windows from tracking your timeline and activity feed.',
      extendedDescription: 'Disables "PublishUserActivities", "UploadUserActivities", and "HistoryItem" policies. \n\n**Visible Effects:** The "Timeline" feature (Task View history) will no longer show past documents or web pages. You will only see currently open windows. Prevents local and cloud logging of your app usage.',
      script: 'disable-activity-history',
      state: undefined,
      loading: true
    },
    { 
      id: 'error-reporting', 
      name: 'Disable Error Reporting', 
      description: 'Prevents crash dumps and error logs from being sent to Microsoft.',
      extendedDescription: 'Disables the Windows Error Reporting (WER) service. \n\n**Visible Effects:** When an app crashes, you will no longer see the "Checking for a solution..." dialog. It will simply close. Crash dumps will not be uploaded to Microsoft servers.',
      script: 'disable-error-reporting',
      state: undefined,
      loading: true
    },
    { 
      id: 'launch-tracking', 
      name: 'Disable App Launch Tracking', 
      description: 'Stops Start Menu from tracking frequently used applications.',
      extendedDescription: 'Disables start menu telemetry features. \n\n**Visible Effects:** The "Most Used" lists in the Start Menu will be grayed out or empty. Windows will stop building a profile of your favorite applications.',
      script: 'disable-app-launch-tracking',
      state: undefined,
      loading: true
    },
    // Network & Security
    { 
      id: 'wifi-sense', 
      name: 'Disable Wi-Fi Sense', 
      description: 'Prevents automatic connection to suggested Wi-Fi hotspots.',
      extendedDescription: 'Disables the feature that automatically connects you to open hotspots and shares Wi-Fi credentials with contacts. \n\n**Visible Effects:** You will have complete manual control over which Wi-Fi networks you join. No automatic connections to public networks.',
      script: 'disable-wifi-sense',
      state: undefined,
      loading: true
    },
    { 
      id: 'remote-assistance', 
      name: 'Disable Remote Assistance', 
      description: 'Blocks unsolicited remote assistance connections.',
      extendedDescription: 'Prevents "Offer Remote Assistance" connections. \n\n**Visible Effects:** Remote Desktop is separate and not affected. This specifically blocks the "Invite someone to help you" legacy feature. Prevents social engineering attacks via help desk impersonation.',
      script: 'disable-remote-assistance',
      state: undefined,
      loading: true
    },
    { 
      id: 'smb1', 
      name: 'Disable SMBv1 Protocol', 
      description: 'Disables the insecure legacy SMBv1 file sharing protocol.',
      extendedDescription: 'Removes the SMB1.0/CIFS File Sharing Support feature. \n\n**Visible Effects:** You may lose connectivity to very old NAS devices or Windows XP/2003 machines on your network. Modern file sharing (SMBv2/v3) is unaffected and faster/safer.',
      script: 'disable-smb1',
      state: undefined,
      loading: true
    },
    { 
      id: 'defender-pua', 
      name: 'Enable Defender PUA Protection', 
      description: 'Enables protection against Potentially Unwanted Applications.',
      extendedDescription: 'Configures Windows Defender to block "Potentially Unwanted Applications" (adware, bundleware, crypto miners). \n\n**Visible Effects:** Defender may flag and block installers that bundle toolbars or free trials. This is a "set and forget" security layer.',
      script: 'enable-defender-pua',
      state: undefined,
      loading: true
    },
    // Advanced Security
    { 
      id: 'llmnr', 
      name: 'Disable LLMNR', 
      description: 'Prevents local network broadcast name resolution leaks.',
      extendedDescription: 'Disables Link-Local Multicast Name Resolution. \n\n**Visible Effects:** No visible impact in a properly configured DNS environment. Prevents attackers on the local network from spoofing names to steal credentials (LLMNR Poisoning).',
      script: 'disable-llmnr',
      state: undefined,
      loading: true
    },
    { 
      id: 'netbios', 
      name: 'Disable NetBIOS', 
      description: 'Disables legacy NetBIOS protocol on network adapters.',
      extendedDescription: 'Disables NetBIOS over TCP/IP on all network cards. \n\n**Visible Effects:** Older network discovery methods (Network Neighborhood style) might be slower or rely on WSD/mDNS. Significant reduction in network noise and attack surface.',
      script: 'disable-netbios',
      state: undefined,
      loading: true
    },
    { 
      id: 'wpad', 
      name: 'Disable WPAD', 
      description: 'Prevents Web Proxy Auto-Discovery attacks.',
      extendedDescription: 'Disables the specialized service that looks for "wpad.dat" to configure proxies automatically. \n\n**Visible Effects:** No impact unless you are in a corporate environment that strictly relies on WPAD (rare). Stops "Man-in-the-Middle" proxy injection attacks.',
      script: 'disable-wpad',
      state: undefined,
      loading: true
    },
    { 
      id: 'rdp', 
      name: 'Disable Remote Desktop', 
      description: 'Completely disables RDP connections and services.',
      extendedDescription: 'Sets "fDenyTSConnections" registry key to 1. \n\n**Visible Effects:** You will not be able to RDP *into* this computer. Outgoing RDP sessions to other computers still work. Critical for preventing brute-force login attempts.',
      script: 'disable-rdp',
      state: undefined,
      loading: true
    },
    { 
      id: 'autoplay', 
      name: 'Disable drive AutoPlay', 
      description: 'Prevents automatic execution of media (USB) content.',
      extendedDescription: 'Disables AutoRun/AutoPlay for all drives (USB, CD, Network). \n\n**Visible Effects:** When you plug in a USB stick, nothing happens automatically. You must open File Explorer manually. Blocks "BadUSB" attacks that try to run scripts immediately upon insertion.',
      script: 'disable-autoplay',
      state: undefined,
      loading: true
    },
    { 
      id: 'psv2', 
      name: 'Disable PowerShell v2', 
      description: 'Removes the legacy PowerShell v2 engine to prevent downgrade attacks.',
      extendedDescription: 'Uninstalls the "MicrosoftWindowsPowerShellV2" feature. \n\n**Visible Effects:** No impact on modern PowerShell scripts. Stops attackers from using the older v2 engine to bypass modern security logging (AMSI) features.',
      script: 'disable-powershell-v2',
      state: undefined,
      loading: true
    },
    // Deep Privacy
    { 
      id: 'clipboard', 
      name: 'Disable Clipboard Sync', 
      description: 'Stops clipboard data from syncing to the cloud.',
      extendedDescription: 'Disables clipboard history cloud sync policies. \n\n**Visible Effects:** "Win+V" will still show local history (if enabled), but your copied text/images will not be accessible on your other devices (Phone/Tablet). Confidentiality first.',
      script: 'disable-clipboard-sync',
      state: undefined,
      loading: true
    },
    { 
      id: 'typing', 
      name: 'Disable Typing Insights', 
      description: 'Prevents Windows from analyzing your typing and inking.',
      extendedDescription: 'DIsables "TypingInsights" and "HandwritingErrorReports". \n\n**Visible Effects:** Windows spelling and prediction features will rely only on local dictionaries. No typing data is sent to the cloud to "improve recognition".',
      script: 'disable-typing-insights',
      state: undefined,
      loading: true
    },
    { 
      id: 'shared-exp', 
      name: 'Disable Shared Experiences', 
      description: 'Stops "Share across devices" tracking.',
      extendedDescription: 'Disables "Project to this PC" and cross-device app launching. \n\n**Visible Effects:** "Continue on PC" features from phone will be disabled. Stops devices on the same account from pinging each other constantly.',
      script: 'disable-shared-experiences',
      state: undefined,
      loading: true
    },
    { 
      id: 'remote-reg', 
      name: 'Disable Remote Registry', 
      description: 'Prevents remote modification of the system registry.',
      extendedDescription: 'Disables the Remote Registry service. \n\n**Visible Effects:** No functionality loss for home users. Critical for security as it prevents attackers on the network from modifying your registry keys remotely.',
      script: 'disable-remote-registry',
      state: undefined,
      loading: true
    }
];
