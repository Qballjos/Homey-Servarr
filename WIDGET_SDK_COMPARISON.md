# Widget Structure Comparison: Current vs SDK Documentation

## Summary
Comparing the current calendar widget implementation against Homey SDK v3 documentation to identify discrepancies.

---

## 1. Widget Declaration in `app.json`

### Current Implementation:
```json
"widgets": {
  "calendar": {
    "id": "calendar",
    "name": {
      "en": "Release Calendar"
    }
  }
}
```

### SDK Documentation Pattern:
**According to SDK docs, widgets are auto-discovered from `/widgets/<widgetId>/` directories.** The `widgets` section in `app.json` may not be required, or if present, should match the auto-discovery format.

**Issue:** The SDK docs don't explicitly show widgets being declared in `app.json`. Widgets are typically auto-discovered from the file system structure. Having widgets declared in `app.json` might be causing the `ManagerDashboards.onAppStart` crash if Homey expects a different format or no declaration at all.

**Difference:** We're declaring widgets in `app.json` when SDK suggests auto-discovery.

---

## 2. Widget Initialization Pattern (`index.html`)

### Current Implementation:
```javascript
function onHomeyReady(Homey) {
  Homey.ready();
  // ... widget code ...
}
```

### SDK Documentation Pattern:
```javascript
Homey.on('init', async () => {
  const settings = await Homey.getSettings();
  const deviceIds = await Homey.getDeviceIds();
  // ... widget code ...
  Homey.ready();
});
```

**Difference:** 
- **Current:** Uses `function onHomeyReady(Homey)` wrapper pattern
- **SDK:** Uses `Homey.on('init', async () => { ... })` pattern
- **Current:** Calls `Homey.getSettings()` and `Homey.getDeviceIds()` synchronously
- **SDK:** Calls them as `await Homey.getSettings()` and `await Homey.getDeviceIds()` (async)

**Issue:** The SDK docs show that `Homey.getSettings()` and `Homey.getDeviceIds()` return Promises and should be awaited. Our current code calls them synchronously, which may work but isn't the documented pattern.

---

## 3. API Endpoint Access Pattern (`index.html`)

### Current Implementation:
```javascript
const data = await Homey.api('GET', '/', { deviceIds: deviceIds.join(',') });
```

### SDK Documentation Pattern:
```javascript
const deviceData = await Homey.api('getDeviceData');
// OR
const deviceData = await Homey.api('GET', '/device-data');
```

**Difference:**
- **Current:** Passes `deviceIds` as query parameters manually
- **SDK:** The API endpoint name should match the key in `widget.compose.json` (`getDeviceData`), and device IDs should be retrieved server-side from widget settings

**Issue:** We're manually passing deviceIds in the query, but the SDK pattern suggests the API should retrieve device IDs from the widget's settings context automatically.

---

## 4. Widget API Implementation (`api.js`)

### Current Implementation:
```javascript
async getDeviceData({ homey, query }) {
  const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
  // ...
  const device = await homey.homey.devices.getDevice({ id: deviceIds[0] });
}
```

### SDK Documentation Pattern:
```javascript
module.exports.getDeviceData = async ({ homey }) => {
  const deviceIds = await homey.getDeviceIds();
  const devices = await Promise.all(
    deviceIds.map(id => homey.devices.getDevice({ id }))
  );
  return deviceData;
};
```

**Differences:**
1. **Device ID retrieval:**
   - **Current:** Gets deviceIds from `query.deviceIds` (passed from frontend)
   - **SDK:** Gets deviceIds from `homey.getDeviceIds()` (server-side method)

2. **Device access:**
   - **Current:** `homey.homey.devices.getDevice()` (double `homey`)
   - **SDK:** `homey.devices.getDevice()` (single `homey`)

3. **Export pattern:**
   - **Current:** `module.exports = { async getDeviceData(...) }`
   - **SDK:** `module.exports.getDeviceData = async (...)`

**Issue:** The SDK shows accessing device IDs server-side via `homey.getDeviceIds()`, not from query parameters. Also, device access should be `homey.devices.getDevice()`, not `homey.homey.devices.getDevice()`.

---

## 5. Widget Settings in `widget.compose.json`

### Current Implementation:
```json
{
  "settings": [
    {
      "id": "device",
      "type": "devices",
      "title": { "en": "Select Servarr Control Hub" },
      "singular": true,
      "filter": { "driver_id": "servarr_hub" }
    }
  ]
}
```

### SDK Documentation Pattern:
```json
{
  "settings": [
    {
      "id": "devices",
      "type": "devices",
      "title": { "en": "Select Devices" },
      "singular": false,
      "type": "app",  // ← This appears in docs but creates duplicate key issue
      "filter": { "driver_id": "servarr_hub" }
    }
  ]
}
```

**Difference:**
- **Current:** Setting ID is `"device"` (singular)
- **SDK:** Setting ID is typically `"devices"` (plural)
- **SDK docs show:** `"type": "app"` property, but this conflicts with `"type": "devices"` (duplicate key in JSON)

**Issue:** The SDK docs show a `"type": "app"` property that would conflict with `"type": "devices"`. This is likely a documentation error or the scope type should be specified differently.

---

## Key Issues Summary

1. **`app.json` widgets declaration:** May not be needed (auto-discovery) or format is incorrect
2. **Initialization pattern:** Should use `Homey.on('init')` instead of `onHomeyReady()` wrapper
3. **Async methods:** `Homey.getSettings()` and `Homey.getDeviceIds()` should be awaited
4. **API device access:** Should use `homey.devices.getDevice()`, not `homey.homey.devices.getDevice()`
5. **Device ID retrieval:** API should get device IDs from `homey.getDeviceIds()`, not query parameters
6. **Export pattern:** API methods should be exported as `module.exports.methodName`, not object property

---

## Recommended Fixes

1. **Remove widgets from `app.json`** (rely on auto-discovery)
2. **Change initialization to `Homey.on('init', async () => { ... })`**
3. **Await `Homey.getSettings()` and `Homey.getDeviceIds()`**
4. **Fix API device access:** `homey.devices.getDevice()` (remove double `homey`)
5. **Fix API device ID retrieval:** Use `homey.getDeviceIds()` server-side
6. **Fix API export pattern:** Use `module.exports.methodName = async (...)`

