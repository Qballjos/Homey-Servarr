Servarr Control Hub - Homey App

An extremely lightweight Homey App for the Homey Pro that functions as a monitoring interface and Flow bridge for the Servarr suite (Radarr, Sonarr, Lidarr, Prowlarr).

🎯 Purpose
This application is optimized for minimal CPU/memory usage and delivers widgets and Flow Cards for monitoring and controlling Servarr applications.

✨ Features

Dashboard Widgets:
1. Release Agenda Today - Shows the total number of planned releases for today.
2. Downloads & Action Panel - Shows queue status with pause/resume buttons and per-item removal.
3. Release Calendar - Interactive calendar widget with Day, Week, and Month views.
4. System Health Status - Unified health overview of all connected Servarr apps.

Flow Cards:
- IF: Grabbed release, Indexer issue (Prowlarr), Download finished, Queue empty, Health check failed, Media added.
- THEN: Run app command (Refresh/Rescan/Backup), Pause/Resume all downloads, Pause/Resume specific app, Search missing items, Toggle monitored status.

🚀 Installation
1. Install the app on your Homey.
2. Add a "Servarr Control Hub" device.
3. Configure the Base URL, Port, and API Key for your Radarr, Sonarr, Lidarr, or Prowlarr instances.

🔧 Technical Details
- Optimized Polling: 5-minute intervals for queue/releases, 15-minute for health/missing/library/indexers.
- Lightweight: Minified widget assets and pruned data storage for minimal RAM footprint.
- SDK v3: Built on the latest Homey SDK v3.

Note: This app is a third-party tool and is not officially affiliated with the Servarr project.
