# Comparison: Working Widget (com.trashchecker) vs Our Widget

## Key Findings from Working Widget

### 1. **Widgets ARE Declared in `app.json`** ✅
**Working Widget:**
```json
"widgets": {
  "trash-reminder-list": {
    "name": { "en": "Trash Overview", "nl": "Afval Overzicht" },
    "transparent": true,
    "settings": [ ... ]
  }
}
```

**Our Widget:**
- ❌ **REMOVED** widgets from app.json (we removed it to fix crash)

**Finding:** The working widget DOES declare widgets in app.json! This means our removal was incorrect. The crash might be due to something else.

---

### 2. **Widget.compose.json Structure**
**Working Widget:**
```json
{
  "name": { "en": "Trash Overview", "nl": "Afval Overzicht" },
  "transparent": true,
  "settings": [ ... ],
  "api": {
    "getSettings": {
      "method": "GET",
      "path": "/collectiondata"
    }
  }
}
```

**Our Widget:**
```json
{
  "name": { "en": "Release Calendar" },
  "settings": [ ... ],
  "height": 400,
  "transparent": true,
  "api": {
    "getDeviceData": {
      "method": "GET",
      "path": "/"
    }
  }
}
```

**Differences:**
- Working widget: No `height` property
- Working widget: API path is `/collectiondata` (not `/`)
- Both have `transparent: true` ✅

---

### 3. **API.js Export Pattern**
**Working Widget (api.ts):**
```typescript
module.exports = {
  async getSettings({ homey, query }: { homey: Homey; query: any }): Promise<WidgetItem[]> {
    // ... implementation
  }
};
```

**Our Widget (api.js):**
```javascript
async function getDeviceData({ homey, params, query, body }) {
  // ... implementation
}

module.exports = {
  getDeviceData
};
```

**Finding:** Both patterns are similar - object export with async function. ✅

---

### 4. **Widget Declaration Location**
**Working Widget:**
- Widgets declared in **BOTH** `app.json` AND `widget.compose.json`
- `app.json` has full widget definition including settings
- `widget.compose.json` also has settings and API definition

**Our Widget:**
- Widgets **REMOVED** from `app.json` (only in `widget.compose.json`)

**Critical Finding:** The working widget declares widgets in `app.json` with the full structure including settings! This is different from what SDK docs suggested (auto-discovery).

---

## What We Need to Fix

### 1. **Add Widgets Back to `app.json`** ⚠️
The working widget shows widgets SHOULD be in app.json. We need to add it back, but with the correct structure matching the working example.

### 2. **Widget Structure in `app.json`**
Based on the working widget, `app.json` should have:
```json
"widgets": {
  "calendar": {
    "name": { "en": "Release Calendar" },
    "transparent": true,
    "settings": [ ... ]  // Same settings as widget.compose.json
  }
}
```

### 3. **API Path**
Working widget uses `/collectiondata` instead of `/`. Our `/` should be fine, but we could be more specific.

---

## Conclusion

The working widget proves that:
1. ✅ Widgets SHOULD be declared in `app.json` (not just auto-discovery)
2. ✅ The structure in `app.json` should match `widget.compose.json` settings
3. ✅ Both files need to exist and be consistent

Our crash might be due to:
- Missing widgets in `app.json` (we removed it)
- Mismatch between `app.json` and `widget.compose.json` structure
- Some other configuration issue

**Action Required:** Add widgets back to `app.json` with the correct structure matching the working widget pattern.

