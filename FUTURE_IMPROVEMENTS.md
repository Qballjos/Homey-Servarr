# Future Improvements

## UI & Flow Polish
- [x] Add `titleFormatted` to Flow cards (download_finished, pause_app) to remove warnings and improve readability.
- [x] Queue widget: optional sort (status/ETA) and compact badges (ETA/size) with minimal text.
- [x] Add an optional “Refresh” button in widgets to update on demand without increasing polling.

## Controls & Actions
- [x] Expose blocklist toggle with brief description in UI/README.
- [x] (Not supported by Servarr APIs) Per-item pause/resume — only remove/block per item or pause/resume per app/all.
- [x] App-specific refresh buttons (optional) to refresh only Radarr/Sonarr/Lidarr queues (driver support added).
- [x] Queue filters (e.g., “Only active”) to hide completed/blocked items.
## Resilience & Errors
- [x] Lightweight retry/back-off on transient network errors (single retry max).
- [x] “Test connection” in settings/pair view to validate API URL/key per app.
- [x] Mask API keys in logs and error surfaces.
- [x] Inline errors per app in widget for common issues (auth/host/timeout).

## Performance Options
- [x] “Manual only” mode: skip scheduled polling, allow user-triggered refresh.
- [x] Keep truncation of lists (releases/queue) and continue skipping updates when no apps are enabled.

## Documentation
- [ ] Add screenshots of widgets and a short troubleshooting section (API key/URL/SSL tips).
- [x] Note that `titleFormatted` has been added for Flow cards (warnings resolved).
- [ ] Add mini stats per app (optional) in widget footer, e.g., “R:2 S:1 L:0”.
- [ ] Normalize ETA/size badges (hh:mm, one-decimal GB) and add status badge (Queued/Downloading/Importing).

