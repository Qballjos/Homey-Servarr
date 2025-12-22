# Project Handover: Servarr Control Hub

This document summarizes the current state of the "Servarr Control Hub" Homey App for future developers and AI assistants.

## 🏗️ Architecture: Homey Compose
The project uses the **Homey Compose** system. **Crucial Rule:** Never edit `app.json` directly. It is a generated file.

- **Source Files**: All manifest definitions reside in the `.homeycompose/` directory and individual `*.compose.json` files.
- **Widgets**: Each widget is defined in its own `widgets/[widget_name]/` directory with a `widget.compose.json`.
- **Flows**: Shared/Driver flow cards are in `.homeycompose/flow/`.
- **Capabilities**: Custom capabilities are in `.homeycompose/capabilities/`.
- **Build Process**: Always run `homey app compose` (or `homey app run`) to regenerate the final `app.json`.

## ⚡ Performance optimizations
The app is specifically tuned for the **Homey Pro (Early 2023)** and **Homey Pro Mini** to ensure minimal memory pressure.

- **Data Pruning**: `device.js` truncates media titles to 40 characters and strips unnecessary API fields before storing data in the `device.store`.
- **Asset Minification**: All widget HTML, CSS, and JS files in `widgets/*/public/` have been manually minified. Avoid adding large libraries or unminified code to these files.
- **Poll Rates**: 
  - Standard (Queue/Releases): 5 minutes.
  - Periodic (Health/Missing/Library): 15 minutes.
- **Fetch Logic**: Implementation of `AbortController` in `ServarrAPI.js` ensures a 15-second timeout, preventing hanging requests.

## 🛠️ Operational Notes
- **Remote Debugging**: Use `homey app run --remote` to bypass local Docker/permission issues and see real-time logs from the hardware.
- **Multi-App Support**: The app handles Radarr, Sonarr, and Lidarr concurrently. Lidarr uses API `v1`, while the others use `v3`.
- **Capability Naming**: Standardized prefixed/non-prefixed names are handled via Compose. Custom sensors use the `measure_` prefix for better UI integration.

## 🚧 Future Considerations
- If adding new widgets, ensure they include `preview-light.png` and `preview-dark.png` in their folder, or the build will fail.
- Keep the `device.store` usage lean; large arrays of objects should always be mapped to minimal representations.

---
*Last Updated: 2025-12-22*
