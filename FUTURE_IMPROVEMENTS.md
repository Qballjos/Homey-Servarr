# Future Improvements

## UI & Flow Polish
- [ ] Add `titleFormatted` to Flow cards (download_finished, pause_app) to remove warnings and improve readability.
- [ ] Queue widget: optional sort (status/ETA) and compact badges (ETA/size) with minimal text.
- [ ] Add an optional “Refresh” button in widgets to update on demand without increasing polling.

## Controls & Actions
- [ ] Expose blocklist toggle with brief description in UI/README.
- [ ] (Not supported by Servarr APIs) Per-item pause/resume — only remove/block per item or pause/resume per app/all.

## Resilience & Errors
- [ ] Lightweight retry/back-off on transient network errors (single retry max).
- [ ] “Test connection” in settings/pair view to validate API URL/key per app.
- [ ] Mask API keys in logs and error surfaces.

## Performance Options
- [ ] “Manual only” mode: skip scheduled polling, allow user-triggered refresh.
- [ ] Keep truncation of lists (releases/queue) and continue skipping updates when no apps are enabled.

## Documentation
- [ ] Add screenshots of widgets and a short troubleshooting section (API key/URL/SSL tips).
- [ ] Note (optional) that `titleFormatted` is still missing but harmless.

