# S.H.I.E.L.D. — System Hardening Interface for Enhanced Logical Defense

<div align="center">

<img src="public/logo.png" width="150" alt="S.H.I.E.L.D. Logo">

<br><br>

![Version](https://img.shields.io/badge/Version-0.0.10-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Beta-yellow?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=for-the-badge&logo=powershell&logoColor=white)](https://microsoft.com/powershell)

</div>

---

> [!NOTE]
> **BETA RELEASE**: This project is in Beta (v0.0.10). Core features are stable, but active development is ongoing.

## 🛡️ Overview

**S.H.I.E.L.D.** (System Hardening Interface for Enhanced Logical Defense) is a high-performance Windows security hardening and system optimization suite. Built using the deep system integration of **PowerShell** and the modern desktop experience of **Electron**, S.H.I.E.L.D. provides a "Lockdown-as-a-Service" interface to fully secure any Windows environment.

## ✨ Key Features

- **🔒 Ultimate Hardening**: One-click lockdown of security vulnerabilities, registry hardening, and firewall optimization.
- **🚀 Auto-Updating**: Seamless background updates via GitHub Releases.
- **🛡️ Admin Mode**: Smart privilege detection with "Relaunch as Admin" capability.
- **🧹 System Decluttering**: Remove telemetry, bloatware, and unnecessary background services.
- **💎 Glassmorphism UI**: A stunning "Pro" aesthetics interface with real-time blur/frost effects and fluid animations.
- **⚡ Real-time Telemetry**: Live monitoring of system security score and threat level.

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
