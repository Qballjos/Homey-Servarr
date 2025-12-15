# Widget Structure Comparison: Our Implementation vs SDK Documentation

## According to Homey SDK v3 Documentation

### Expected Structure:
```
widgets/<widgetId>/
├── widget.compose.json    ✅ We have this
├── public/
│   └── index.html         ✅ We have this
├── api.js                 ✅ We have this
├── preview-dark.png       ✅ We have this
└── preview-light.png      ✅ We have this
```

### Expected widget.compose.json Format:

```json
{
  "name": { "en": "Widget Name" },
  "settings": [
    {
      "id": "devices",
      "type": "devices",
      "title": { "en": "Select Devices" },
      "singular": true,
      "type": "app",           // ⚠️ MISSING: Scope restriction
      "filter": {
        "driver_id": "servarr_hub"
      }
    }
  ],
  "height": 200,
  "transparent": true,
  "api": {
    "getDeviceData": {
      "method": "GET",
      "path": "/"
    }
  }
}
```

### Expected index.html Format:

```html
<script>
  function onHomeyReady(Homey) {  // ✅ We have this
    Homey.ready();
    
    // Access device IDs
    const deviceIds = Homey.getDeviceIds();  // ✅ We use this
    
    // Access widget settings
    const settings = Homey.getSettings();  // ❌ We don't use this
    
    // Call API
    const data = await Homey.api('GET', '/', {});  // ✅ We use this
  }
</script>
```

---

## Our Current Implementation

### widget.compose.json Differences:

**❌ MISSING: `"type": "app"` property**
- **What we have:**
  ```json
  {
    "id": "device",
    "type": "devices",
    "singular": true,
    "filter": {
      "driver_id": "servarr_hub"
    }
  }
  ```

- **What SDK docs show:**
  ```json
  {
    "id": "device",
    "type": "devices",
    "singular": true,
    "type": "app",        // ⚠️ This property is missing
    "filter": {
      "driver_id": "servarr_hub"
    }
  }
  ```

**Issue:** JSON doesn't allow duplicate `"type"` keys, so this seems like a documentation inconsistency. However, the SDK docs explicitly state that `"type": "app"` should be present to restrict device selection to app devices.

**Possible Solution:** The `"type": "app"` might need to be at a different level, or the filter might be sufficient. But according to docs, it should be there.

### index.html Differences:

**✅ CORRECT: Using `onHomeyReady(Homey)` wrapper**
- We correctly wrap code in `function onHomeyReady(Homey) { ... }`

**✅ CORRECT: Using `Homey.getDeviceIds()`**
- We correctly get device IDs: `const deviceIds = Homey.getDeviceIds()`

**✅ CORRECT: Using `Homey.api()`**
- We correctly call API: `await Homey.api('GET', '/', { deviceIds: ... })`

**❌ POTENTIAL ISSUE: Not using `Homey.getSettings()`**
- SDK docs show accessing widget settings via `Homey.getSettings()`
- We're passing `deviceIds` as query parameters instead
- This might work, but the SDK pattern is to use `Homey.getSettings()` to get the selected device IDs

### api.js Differences:

**✅ CORRECT: Module exports structure**
- We correctly export: `module.exports = { async getDeviceData({ homey, query }) { ... } }`

**❌ POTENTIAL ISSUE: Accessing devices**
- **What we do:**
  ```js
  const device = await homey.app.homey.devices.getDevice({ id: deviceIds[0] });
  ```

- **What SDK docs suggest:**
  - Access via `homey.app` instance
  - But the exact pattern isn't clear from docs

---

## Summary of Differences

### 1. **Device Setting Scope (`widget.compose.json`)**
- **Missing:** `"type": "app"` property to restrict device selection to app devices
- **Why:** JSON doesn't allow duplicate keys, so we removed it when fixing JSON errors
- **Impact:** Widgets might not properly filter to app devices only

### 2. **Widget Settings Access (`index.html`)**
- **Missing:** Using `Homey.getSettings()` to get widget settings
- **Current:** We pass `deviceIds` as query parameters to API
- **Impact:** Might work, but not following SDK pattern

### 3. **Device Access Pattern (`api.js`)**
- **Current:** `homey.app.homey.devices.getDevice({ id: ... })`
- **Unclear:** SDK docs don't show exact pattern for accessing devices from widget API
- **Impact:** Might work, but pattern seems unusual (double `homey`)

---

## Why Widgets Aren't Visible

The most likely reason widgets aren't showing up:

1. **Missing `"type": "app"` in device setting** - Homey might not recognize the device filter without the scope type
2. **Widgets not in `app.json`** - We removed them to fix crashes, but they might need to be declared there
3. **Device setting format** - The filter might need to be structured differently
