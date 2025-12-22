# Missing Elements According to SDK Documentation

## Current Issues Found:

### 1. **Homey.api() Call Pattern** ❌
**Current:**
```javascript
const data = await Homey.api('getDeviceData');
```

**SDK Documentation Pattern:**
```javascript
Homey.api('GET', 'getDeviceData', null)
  .then(response => {
    // Handle response
  })
  .catch(error => {
    // Handle error
  });
```

**Issue:** `Homey.api()` requires 3 parameters: `(method, path, body)`. We're only passing the endpoint name.

**Fix Required:** Change to `Homey.api('GET', 'getDeviceData', null)` or `Homey.api('GET', '/', null)` (matching the path in widget.compose.json).

---

### 2. **Script Source Path** ⚠️
**Current:**
```html
<script src="/lib/homey.js"></script>
```

**SDK Documentation Pattern:**
```html
<script src="/homey.js" type="text/javascript"></script>
```

**Issue:** SDK docs show `/homey.js` (root path), but we have `/lib/homey.js`. This might be project-specific, but SDK shows root path.

**Note:** This might be correct for our project structure, but differs from SDK example.

---

### 3. **API.js Export Pattern** ⚠️
**Current:**
```javascript
module.exports.getDeviceData = async ({ homey }) => {
  // ...
};
```

**SDK Documentation Pattern:**
```javascript
async function getDeviceData({ homey, params, query, body }) {
  // ...
}

module.exports = {
  getDeviceData,
  // other methods...
};
```

**Issue:** SDK shows exporting as an object with function names, not as individual properties.

**Note:** Both patterns might work, but SDK shows object export pattern.

---

### 4. **API Function Parameters** ⚠️
**Current:**
```javascript
module.exports.getDeviceData = async ({ homey }) => {
  // Only using homey
};
```

**SDK Documentation Pattern:**
```javascript
async function getDeviceData({ homey, params, query, body }) {
  // SDK shows all parameters available
}
```

**Issue:** SDK shows that API functions receive `{ homey, params, query, body }`, but we're only destructuring `homey`. This is fine if we don't need the others, but SDK shows the full signature.

---

### 5. **Settings Change Listener** ❌
**SDK Documentation Pattern:**
```javascript
Homey.on('settings.set', fetchData);
```

**Current:** Missing - we don't listen for settings changes to refresh data.

**Issue:** SDK docs show listening for `settings.set` event to refresh widget when settings change.

---

### 6. **Initial Data Load Timing** ⚠️
**Current:**
```javascript
Homey.on('init', async () => {
  // ... setup code ...
  loadCalendarData(); // Called immediately
  Homey.ready(); // Called at end
});
```

**SDK Documentation Pattern:**
```javascript
Homey.on('init', async () => {
  // ... setup code ...
});

Homey.ready();
fetchData(); // Called after ready
```

**Issue:** SDK shows `Homey.ready()` called separately, then data fetch. Our pattern might work but differs slightly.

---

## Summary of Required Fixes:

1. ✅ **Fix Homey.api() call** - Use `Homey.api('GET', 'getDeviceData', null)` or `Homey.api('GET', '/', null)`
2. ⚠️ **Consider script path** - Verify if `/lib/homey.js` is correct or should be `/homey.js`
3. ⚠️ **Consider API export pattern** - Change to object export if needed
4. ✅ **Add settings change listener** - Add `Homey.on('settings.set', loadCalendarData)`
5. ⚠️ **Verify Homey.ready() timing** - Ensure it's called correctly

---

## Critical Fixes Needed:

1. **Homey.api() signature** - Must match SDK pattern with 3 parameters
2. **Settings change listener** - Should refresh widget when settings change

