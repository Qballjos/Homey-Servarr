# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-12-15 - SDK v3 Migration & Widget Improvements

### Added
- **Calendar Widget**: New interactive calendar widget with Day, Week, and Month views
  - Color-coded releases: Radarr (yellow), Sonarr (blue), Lidarr (green)
  - Download status indicators
  - Navigation controls for browsing releases
  - Displays releases from current month ± 1 month
- **Immediate Data Refresh**: Settings changes now trigger immediate data update (no waiting for polling interval)
- **Standard SDK Settings**: Device settings now use Homey's standard settings interface (no custom HTML)

### Changed
- **Migrated to Homey SDK v3**: Complete migration from SDK v2 to SDK v3
  - Flow cards now use `getTriggerCard()`/`getActionCard()` instead of deprecated constructors
  - Pairing flow uses standard SDK templates (`list_devices`, `add_devices`)
  - Settings defined in `app.json` using standard SDK types
  - Timer management uses `this.homey.setInterval()`/`clearInterval()` for automatic cleanup
- **Improved API Client**: Enhanced URL parsing and port detection
  - Automatic API version detection (Lidarr v1, Radarr/Sonarr v3)
  - Better error messages for connection failures
- **Widget Structure**: Widgets moved to driver directory structure (`drivers/servarr_hub/widgets/`)
- **Compatibility**: Updated minimum Homey firmware requirement to 12.3.0 (required for widgets)

### Removed
- Custom pairing HTML (`pair/setup.html`) - replaced with standard SDK templates
- Custom settings HTML (`settings/settings.html`) - replaced with standard SDK settings
- Unused Flow Card classes (`lib/flow/*.js`) - Flow cards now registered directly in `app.js`
- Redundant driver compose files (`driver.compose.json`, `driver.settings.compose.json`)

### Fixed
- Device pairing now works correctly with standard SDK flow
- Settings are immediately applied and trigger data refresh
- Widgets are properly discoverable in Homey dashboard
- Improved error handling during device initialization

## [1.3.0] - 2024-XX-XX - Complete Feature Set

### Added
- Flow Action: Toggle monitored status (enable/disable monitoring for specific items by title)
- Capability: measure_library_size (total movies/series/albums count)
- API methods: getImportListStatus() ready for future use
- Enhanced error handling: per-app error tracking and display

### Changed
- Polling: Library size added to 15-minute interval (health/missing/library)
- Improved Flow card titles with titleFormatted for better readability

## [1.2.0] - 2024-XX-XX - Health, Missing Search, Media Added

### Added
- Flow Trigger: Health check failed (per app, new issues only)
- Flow Trigger: Media item added (movie/series/album/artist)
- Flow Action: Resume [APP] Downloads (per app)
- Flow Action: Search missing items for [APP]
- Capability: measure_missing_count (wanted items count)
- Capability: queue_paused (true if any app queue is paused)

### Changed
- Polling: Added 15-minute interval for health + missing count (lightweight)
- Queue status: tracks paused apps and exposes queue_paused capability

## [1.1.0] - 2024-XX-XX - Universal App with Toggle Switches

### Added

- **Toggle Switches**: Each Servarr application can now be individually enabled/disabled via a toggle switch in the configuration
- **Universal Compatibility**: App now works with Servarr on any platform (Docker, native installation, Unraid, etc.)
- **Flexible Configuration**: Users can choose which apps they want to use without configuring all apps

### Changed

#### Configuration Interface
- Added: Toggle switches for Radarr, Sonarr, and Lidarr
- Added: Visual feedback when an app is disabled (grayed out section)
- Improved: Base URL placeholder text now supports both IP addresses and domain names
- Improved: Configuration fields are automatically hidden when an app is disabled

#### Device Logic
- Changed: Only enabled apps are initialized and used
- Added: Device status is automatically updated when no apps are enabled
- Improved: Better error handling when initializing clients

#### Documentation
- Updated: README removed Unraid-specific references
- Updated: INSTALLATION.md with instructions for toggle switches
- Updated: App description in app.json for universal compatibility

### Technical Details

#### New Settings
- `radarr_enabled` (boolean) - Enables/disables Radarr
- `sonarr_enabled` (boolean) - Enables/disables Sonarr
- `lidarr_enabled` (boolean) - Enables/disables Lidarr

#### Behavior
- When an app is disabled, the client is not initialized
- Only enabled apps are used for:
  - Polling (releases, queue count)
  - Flow triggers (download finished, queue empty)
  - Flow actions (pause/resume)
- Device becomes "unavailable" when no apps are enabled

### Usage

1. Open device settings during pairing or via device settings
2. Use the toggle switch at the top of each app section to enable/disable apps
3. Configure only the enabled apps
4. Apps can be enabled/disabled at any time without removing the device

### Compatibility

- Works with Servarr on:
  - Docker containers
  - Native installations (Windows, Linux, macOS)
  - Unraid
  - Synology NAS
  - QNAP NAS
  - Any other platform where Servarr runs

### Migration

Existing devices continue to work. When editing settings, users can now use toggle switches to enable/disable apps.

## [1.0.0] - 2024-XX-XX - Initial Release

### Added

- Initial release of Servarr Control Hub Homey App
- Support for Radarr, Sonarr, and Lidarr
- Dashboard widgets:
  - Release Agenda Today
  - Downloads & Action Panel
- Flow Cards:
  - Triggers: Download Finished, Queue Empty
  - Actions: Pause All, Resume All, Pause App
- Lightweight design optimized for Homey Pro Mini
- 5-minute polling interval
- Direct API communication with Servarr applications
