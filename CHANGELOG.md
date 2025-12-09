# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- Initial release of Servarr Flow Control Homey App
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
