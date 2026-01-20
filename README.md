# S.H.I.E.L.D. — System Hardening Interface for Enhanced Logical Defense

<div align="center">

<img src="public/logo.png" width="500" alt="S.H.I.E.L.D. Logo">

<br><br>

![Version](https://img.shields.io/badge/Version-1.2.1-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=for-the-badge&logo=powershell&logoColor=white)](https://microsoft.com/powershell)

</div>

---

## 🛡️ Overview

**S.H.I.E.L.D.** (System Hardening Interface for Enhanced Logical Defense) is a high-performance Windows security hardening and system optimization suite. Built using the deep system integration of **PowerShell** and the modern desktop experience of **Electron**, S.H.I.E.L.D. provides a "Lockdown-as-a-Service" interface to fully secure any Windows environment.

## ✨ Key Features

- **🔒 Ultimate Hardening**: One-click lockdown of security vulnerabilities, registry hardening, and firewall optimization.
- **📦 App Store (Winget UI)**: Native interface for the Windows Package Manager. Search, install, and manage software packages securely. Includes an "Essentials" section for bulk Ninite-style installations.
- **⚡ God Mode**: Advanced dashboard giving you instant access to 25+ administrative system tools (RegEdit, Group Policy, Services, etc.) in one place.
- **👻 Identity Kill Switch**: Instant MAC Address randomization and network stack flush (DNS/IP) to completely refresh your digital fingerprint.
- **💾 Configuration Portability**: Export and Import your system hardening profiles JSON files. Share configurations or back them up with ease.
- **🚀 Instant Load Technology**: Persistent JSON state caching ensures near-instant startup for hardening modules.
- **🌗 Dark / Light Mode**: Beautiful glassmorphism UI with a dynamic red (stealth) and blue (corporate) theme toggle.
- **🚀 Auto-Updating**: Seamless background updates via GitHub Releases.
- **🛡️ Admin Mode**: Smart privilege detection with "Relaunch as Admin" capability.
- **🧹 System Debloat**: Remove telemetry, bloatware, and unnecessary background services.

## 🛠️ Architecture

S.H.I.E.L.D. is built on a robust multi-process architecture:

| Component | Description |
|-----------|-------------|
| **Frontend** | Angular 17+ Standalone Components with Signals and Reactive Forms. |
| **Electron** | Secure IPC Bridge enforcing strict isolation and context separation. |
| **Logic** | Native PowerShell scripts signed and executed securely. |

## 🚀 Getting Started

### Prerequisites

- **OS**: Windows 10/11
- **Node.js**: v18+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/shield.git
   cd shield
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run make
   ```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Generated with ❤️ by Victor Kane
</p>
