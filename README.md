# Servarr Flow Control - Homey App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Homey SDK](https://img.shields.io/badge/Homey%20SDK-v3-blue)](https://apps-sdk-v3.developer.athom.com/)

An extremely lightweight Homey App for the Homey Pro Mini that functions as a read-only monitoring interface and Flow bridge to control the Servarr suite (Radarr, Sonarr, Lidarr). Works with Servarr applications on any platform (Unraid, Docker, native installations, etc.).

## 🎯 Purpose

This application is optimized for minimal CPU/memory usage and delivers the required widgets and Flow Cards for monitoring and controlling Servarr applications.

## ✨ Features

### Dashboard Widgets

1. **Release Agenda Today** - Shows the total number of planned releases (movies, series, albums) for today
2. **Downloads & Action Panel** - Shows queue status with pause/resume buttons
   - Per-item controls: remove or block+remove downloads, with app color flags (Sonarr blue, Radarr yellow, Lidarr green)
   - Note: per-item pause/resume is not supported by Servarr APIs; only remove/block per item or pause/resume the full queue (per app/all)

### Flow Cards

#### IF... Triggers (Status Reporting)
- **A download has finished** - Triggered when a download successfully completes (with media title as tag)
- **The queue is empty** - Triggered when the total queue of all apps drops to zero

#### THEN... Actions (Action Control)
- **Pause all Servarr Downloads** - Pauses downloads in all configured Servarr applications
- **Resume all Servarr Downloads** - Resumes downloads in all configured Servarr applications
- **Pause [APP] Downloads** - Pauses downloads for a specific app (Radarr/Sonarr/Lidarr)

## 🚀 Installation

1. Copy this app to your Homey App directory
2. Install via the Homey Developer Console or via `homey app install`
3. Add a "Servarr Control Hub" device via the Homey app
4. Configure the API settings for Radarr, Sonarr and/or Lidarr

## ⚙️ Configuration

When adding the device, configure:

- **Radarr**: Base URL, port (default 7878), API key
- **Sonarr**: Base URL, port (default 8989), API key
- **Lidarr**: Base URL, port (default 8686), API key

You don't need to configure all apps - only the apps you use.

## 🔧 Technical Details

### Performance Optimizations

- **Polling Interval**: 5 minutes for most data (as required)
- **Efficient API Calls**: Minimal data transfer, only required information
- **Caching**: Results are cached where possible
- **Lightweight**: Optimized for Homey Pro Mini

### API Communication

The app communicates directly with Servarr APIs via HTTP/HTTPS:
- Radarr API v3
- Sonarr API v3
- Lidarr API v3

### Capabilities

The device has the following capabilities:
- `text_today_releases` - Text display of the number of releases today
- `measure_queue_count` - Measurement of the number of items in the queue

## 📝 Development

### Project Structure

```
Homey Servarr/
├── app.json                 # App manifest
├── drivers/
│   └── servarr_hub/
│       ├── driver.js        # Driver implementation
│       ├── device.js        # Device implementation
│       ├── pair/
│       │   └── setup.html   # Setup interface
│       └── widgets/         # Dashboard widgets
├── lib/
│   ├── ServarrAPI.js        # API client library
│   └── flow/                # Flow card implementations
├── locales/                 # Translations (EN)
└── assets/                  # App icons
```

### Code Documentation

The code contains extensive comments about efficiency choices and implementation details.

## 📄 License

This app is developed for use with Homey and Servarr applications.

## 🤝 Support

For questions or problems:
- Check the [Installation Guide](INSTALLATION.md)
- Review [existing issues](https://github.com/Qballjos/Homey-Servarr/issues)
- Start a [discussion](https://github.com/Qballjos/Homey-Servarr/discussions)
- Consult the [Homey Developer documentation](https://apps-sdk-v3.developer.athom.com/) or [Servarr API documentation](https://wiki.servarr.com/)

## 📝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Homey ecosystem
- Compatible with Radarr, Sonarr, and Lidarr
- Inspired by the Servarr community
