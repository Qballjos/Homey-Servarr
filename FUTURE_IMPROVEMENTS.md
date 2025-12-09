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
- [x] Add mini stats per app (optional) in widget footer, e.g., "R:2 S:1 L:0".
- [x] Normalize ETA/size badges (hh:mm, one-decimal GB) and add status badge (Queued/Downloading/Importing).

## Additional API Features (Based on Servarr API Analysis)

### High Priority (Lightweight & Useful)
- [ ] **Resume [APP] Downloads Action** - Add per-app resume Flow action (complements pause_app).
- [ ] **Health Check Trigger** - Flow trigger when Servarr health check fails (poll every 15 min).
- [ ] **Missing Items Count** - Capability/widget to show wanted but not downloaded items count.

### Medium Priority
- [ ] **Search for Missing Items Action** - Flow action to trigger searches for missing movies/series/albums.
- [ ] **Queue Status Capability** - Track if queue is paused (onoff.queue_paused) for Flow conditions.
- [ ] **Media Added Trigger** - Flow trigger when new movie/series/album is added to library.

### Low Priority (Nice to Have)
- [ ] **Toggle Monitored Status Action** - Flow action to enable/disable monitoring for specific items.
- [ ] **Library Size Widget** - Display total number of movies/series/albums in library.
- [ ] **Import List Status** - Monitor import lists (Trakt, etc.) status.

**Note**: See `API_FEATURES_ANALYSIS.md` for detailed analysis of available Servarr API endpoints and implementation recommendations.

