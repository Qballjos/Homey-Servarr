# Servarr Flow Control – Project Overview

## What This Repo Contains
- Homey app (SDK v3) that monitors and controls Servarr apps (Radarr, Sonarr, Lidarr).
- Single device: **Servarr Control Hub** (per-app toggles for enable/disable, base URL, port, API key).
- Minimal permissions (none requested), lightweight polling (5 minutes).
- Ready for Homey App Store publish-level validation.

## Core Functionality
- **Monitoring**
  - Releases today (aggregated across enabled apps).
  - Queue count (aggregated).
  - Queue/list detail stored in device store for widgets.
- **Widgets**
  - *Release Agenda Today*: per-app list with colored flags (Sonarr blue, Radarr yellow, Lidarr green) and checkmarks for available items.
  - *Downloads & Action Panel*: queue list with per-item remove/block, app color flags, status, and pause/resume-all buttons.
- **Flows**
  - Triggers: download finished, queue empty.
  - Actions: pause all, resume all, pause per app.

## Capabilities & Data
- Capabilities (declared in device class): `text_today_releases`, `measure_queue_count`.
- Device store keys used by widgets:
  - `today_releases`: array of releases { app, title, hasFile }.
  - `queue_items`: array of queue items { app, id, title, status, size?, timeLeft? }.

## API Notes (Servarr)
- Calendar: `/api/v3/calendar?start=..&end=..`
- Queue: `/api/v3/queue`
- History: `/api/v3/history`
- Pause/Resume: `/api/v3/command` (Pause/Resume) with fallbacks to `/queue/pause|resume`.
- Remove queue item: `DELETE /api/v3/queue/{id}?removeFromClient=true&blocklist=false` (toggle blocklist as needed).

## Assets (sizes required by Homey)
- App icons: `assets/images/small.png` (250x175), `large.png` (500x350), `xlarge.png` (1024x1024).
- Device icons: `drivers/servarr_hub/assets/images/small.png` (75x75), `large.png` (500x500).
- `assets/icon.svg` present.

## Development Workflow (best practice)
1) Install Homey CLI: `npm install -g homey`
2) Validate before commit: `homey app validate`
3) Run locally when needed: `homey app run`
4) Tests to cover (manual):
   - Pairing + settings (per-app enable, URL, API key, ports)
   - Widgets (releases list, queue list, per-item remove/block, colors, counts)
   - Flows (triggers/actions)
   - Error cases: bad API key, unreachable host
5) Update docs when user-facing changes occur:
   - README, INSTALLATION, CHANGELOG, APP_STORE_CHECKLIST
6) Use existing templates:
   - Issues: bug/feature templates
   - PRs: pull_request_template

## Repository Practices
- Branch from `master`; commit with clear messages; run validation before push.
- Keep assets in required dimensions; avoid adding unused binaries.
- Minimal permissions; keep manifest clean.
- Note: Flow card `titleFormatted` warnings are known and can be addressed later.

## Publish Checklist (short)
- `homey app validate` (publish) passes ✅
- Icons correct sizes ✅
- Brand color set (`#4B0082`) ✅
- Docs updated (README/INSTALLATION/CHANGELOG if applicable)
- Optional: add `titleFormatted` for Flow cards to clear warnings

