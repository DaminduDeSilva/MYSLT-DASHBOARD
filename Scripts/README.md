# MySLT Production Log Agents (Fluent Bit) 🚀

This folder contains the production configuration and simulator scripts for forwarding logs to the MySLT Dashboard.

## 📄 Key Files
- `fluent-bit-linux.conf` - Config for Linux (Rocky/Ubuntu)
- `fluent-bit-windows.conf` - Config for Windows (**MSI Installation**)
- `parsers.conf` - Shared Regex-based CSV parser
- `simulate-logs.sh` - Linux log generator
- `simulate-logs.ps1` - Windows log generator

## 🚀 Quick Setup
For step-by-step instructions on installation, deployment, and troubleshooting, please refer to the:
👉 **[TRANSITION_GUIDE.md](./TRANSITION_GUIDE.md)**

## 🪟 Windows Note
The Windows configuration is optimized for the **Official MSI Installer** which installs to:
`C:\Program Files (x86)\fluent-bit`
