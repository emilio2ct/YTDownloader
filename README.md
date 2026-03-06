# 🎥 Secure YouTube Downloader

A robust, private, and high-performance YouTube video downloader with a premium dark-mode UI.

## ✨ Features
- **High Quality**: Merges the best video and audio streams using `yt-dlp` and `ffmpeg`.
- **Private**: No external APIs used; everything runs locally on your machine.
- **Secure**: Built-in rate limiting, concurrency protection, and URL sanitization.
- **Persistent**: Managed by PM2 to stay online after computer restarts.
- **Mobile Responsive**: Sleek glassmorphism UI that works on all devices.

---

## 🚀 Setup for New Computers (Windows)

### 1. Install Prerequisites
Run these commands in a PowerShell (Admin) terminal:
```powershell
# Install FFmpeg
winget install ffmpeg

# Install yt-dlp (requires Python)
pip install yt-dlp
```

### 2. Clone and Install
```bash
git clone https://github.com/emilio2ct/YTDownloader.git
cd YTDownloader
npm install
```

### 3. Run the App
```bash
# Manual Start
node server.js

# Permanent Start (Auto-restart on reboot)
npm install -g pm2 pm2-windows-startup
pm2 start server.js --name "yt-downloader"
pm2-startup install
pm2 save
```

---

## 🛠️ Usage
1. Open your browser to `http://localhost:3000`.
2. Paste a YouTube link and hit **Download**.
3. The video will be processed and downloaded to your default browser download folder.

## 🛡️ Security Note
This project is configured with a `.gitignore` to ensure your local usernames, temporary files, and system logs are never uploaded to GitHub.
