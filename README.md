# Servarr Control Hub - Homey App

<img src="assets/images/app logo.png" alt="Servarr Control Hub" width="120" />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Homey SDK](https://img.shields.io/badge/Homey%20SDK-v3-blue)](https://apps-sdk-v3.developer.athom.com/)

An extremely lightweight Homey App for the Homey Pro and Homey Pro Mini that functions as a monitoring interface and Flow bridge for the Servarr suite (Radarr, Sonarr, Lidarr, Prowlarr).

## 🎯 Purpose

This application is optimized for minimal CPU/memory usage and delivers the required widgets and Flow Cards for monitoring and controlling Servarr applications.

## ✨ Features

### Dashboard Widgets

1. **Release Agenda Today** - Shows the total number of planned releases (movies, series, albums) for today
2. **Downloads & Action Panel** - Shows queue status with pause/resume buttons
   - Per-item controls: remove or block+remove downloads, with app color flags (Sonarr blue, Radarr yellow, Lidarr green, Prowlarr purple)
   - Badge: shows ETA (hh:mm) when available and size (MB/GB) per item
   - Global controls: pause/resume all or per app
3. **Release Calendar** - Interactive calendar widget with Day, Week, and Month views
   - Color-coded releases and navigation controls
4. **System Health Status** - Unified overview of connectivity and health for all connected Servarr apps

### Flow Cards

#### IF... Triggers (Status Reporting)
- **A release has been grabbed** - [NEW] Triggered as soon as a release is identified and sent to the download client
- **An indexer has an issue** - [NEW] Specifically for Prowlarr, triggered when an indexer is detected as down
- **A download has finished** - Triggered when a download successfully completes
- **The queue is empty** - Triggered when the total queue drops to zero
- **Health check failed** - Triggered when Servarr reports a health warning/error
- **A media item was added** - Triggered when a movie/series/album/artist is added

#### THEN... Actions (Action Control)
- **Run command on [APP]** - [NEW] Generic action to execute various commands (e.g., Refresh, Rescan, Backup)
- **Pause/Resume all Downloads** - Control all configured Servarr applications
- **Pause/Resume [APP] Downloads** - Control a specific app
- **Search missing items for [APP]** - Triggers a search for missing items
- **Toggle monitored status** - Enable/disable monitoring for a specific media item

## 🚀 Installation

1. Copy this app to your Homey App directory
2. Install via the Homey Developer Console or via `homey app install`
3. Add a "Servarr Control Hub" device via the Homey app
4. Configure the API settings for Radarr, Sonarr, Lidarr, and/or Prowlarr

## ⚙️ Configuration

Configure each app you use:
- **Radarr**: Port 7878
- **Sonarr**: Port 8989
- **Lidarr**: Port 8686
- **Prowlarr**: Port 9696
- **Manual refresh only**: skip scheduled polling; use widget refresh instead

## 🔧 Technical Details

### Performance Optimizations
- **Poll Rates**: 5 minutes for queue/releases, 15 minutes for health/missing/library/indexers.
- **Data Pruning**: Truncates media titles and strips API overhead before storage.
- **Minified Assets**: Widget UI assets are minified for minimal memory pressure.

### API Communication
- Radarr/Sonarr API v3
- Lidarr/Prowlarr API v1
- Implements `AbortController` with 15s timeouts.

### Capabilities

The device has the following capabilities:
- `measure_today_releases` - Number of releases today
- `measure_queue_count` - Measurement of the number of items in the queue
- `measure_missing_count` - Count of missing/wanted items across enabled apps
- `measure_library_size` - Total number of movies/series/albums in library
- `queue_paused` - Indicates if any configured app queue is paused

## 📝 Development

### Project Structure

```
Homey Servarr/
├── app.json                 # App manifest (SDK v3)
├── drivers/
│   └── servarr_hub/
│       ├── driver.js        # Driver implementation
│       ├── device.js        # Device implementation
│       └── widgets/         # Dashboard widgets
│           ├── release_agenda/
│           ├── downloads_panel/
│           └── calendar/
├── lib/
│   └── ServarrAPI.js        # API client library
├── locales/                 # Translations (EN)
└── assets/                  # App icons
```

### Code Documentation

The code contains extensive comments about efficiency choices and implementation details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
