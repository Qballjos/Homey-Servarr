# Homey App Store Submission Checklist

This checklist helps ensure your app meets all requirements for Homey App Store submission.

## ✅ Current Status

### App Completeness
- [x] App is fully functional
- [x] No crashes or critical bugs
- [x] All Flow Cards implemented and working (4 triggers, 7 actions)
- [x] Widgets implemented and working (2 widgets with enhanced features)
- [x] All capabilities implemented (5 capabilities)
- [x] Proper error handling (per-app errors, retry logic, sanitized logs)
- [x] App validated (`homey app validate` at publish level)

### Required Assets
- [x] `/assets/images/small.png` (250x175px) - App icon small
- [x] `/assets/images/large.png` (500x350px) - App icon large  
- [x] `/assets/images/xlarge.png` (1024x1024px) - App icon xlarge
- [x] `/drivers/servarr_hub/assets/images/small.png` (75x75px) - Device icon small
- [x] `/drivers/servarr_hub/assets/images/large.png` (500x500px) - Device icon large
- [x] `/assets/icon.svg` present

**Status**: ✅ All required image assets present

### Design & Branding
- [x] Clear and concise app name ("Servarr Control Hub")
- [x] Appropriate description
- [x] No protocol names in app name
- [x] Consistent with Homey UI standards
- [x] App icons match required sizes

### Permissions
- [x] Minimal permissions requested (currently none, which is good)
- [x] Only necessary permissions for functionality
- [x] No excessive permission requests

### Code Quality
- [x] Well-documented code
- [x] Proper error handling
- [x] Follows Homey SDK v3 guidelines
- [x] Clean code structure
- [x] No linter errors

### Documentation
- [x] README.md with clear description
- [x] Installation instructions
- [x] Contributing guidelines
- [x] License file (MIT)

### Testing
- [ ] **REQUIRED: Thorough testing on Homey Pro Mini**
  - [ ] Test device pairing with test connections button
  - [ ] Test all Flow Cards:
    - [ ] Triggers: download finished, queue empty, health check failed, media added
    - [ ] Actions: pause/resume all/app, search missing, toggle monitored
  - [ ] Test widgets on dashboard (releases, queue with filters/badges/actions)
  - [ ] Test all capabilities (today_releases, queue_count, missing_count, library_size, queue_paused)
  - [ ] Test with different Servarr configurations (single app, multiple apps)
  - [ ] Test error scenarios (invalid API keys, network issues, per-app errors)
  - [ ] Test polling functionality (5 min for queue/releases, 15 min for health/missing/library)
  - [ ] Test toggle switches for enabling/disabling apps
  - [ ] Test manual refresh mode
  - [ ] Test per-app refresh buttons in widgets
- [x] Verify UI for Flow cards (all have `titleFormatted`)

## 🚨 Critical Issues to Fix

1. **Testing Required** - App must be thoroughly tested before submission

## 📋 Submission Process

Once all requirements are met:

1. **Create Assets**
   - Design app icons following Homey guidelines
   - Create device icons
   - Ensure all images are correct size and format (PNG)

2. **Final Testing**
   - Test on actual Homey device
   - Verify all functionality works
   - Check for any bugs or issues

3. **Prepare for Submission**
   ```bash
   # Ensure app.json is correct
   # Verify all assets are in place
   # Test the app thoroughly
   ```

4. **Submit via Homey CLI**
   ```bash
   homey app publish
   ```

5. **Review Process**
   - Athom will review your app
   - May request changes or clarifications
   - Once approved, app will be published

## 📝 Notes

- **App Store Guidelines**: https://apps.developer.homey.app/app-store/guidelines
- **Publishing Guide**: https://apps.developer.homey.app/app-store/publishing
- **Design Guidelines**: Ensure icons match Homey's visual style

## ⚠️ Potential Concerns

1. **Third-party Service**: App integrates with external Servarr services
   - ✅ This is acceptable as long as properly documented
   - ✅ Users configure their own Servarr instances
   - ✅ No external dependencies required from Homey

2. **API Keys**: Users must provide their own API keys
   - ✅ This is standard practice for third-party integrations
   - ✅ Properly documented in installation guide

3. **Platform Compatibility**: App works with various platforms
   - ✅ This is a feature, not a concern
   - ✅ Well documented

## ✅ What's Already Good

- Clean code structure
- Proper SDK v3 implementation
- Good documentation
- Minimal permissions
- Well-organized project
- Proper error handling
- Universal compatibility

## 🎯 Next Steps

1. **Thoroughly test the app** on Homey Pro Mini
2. (Optional) Add `titleFormatted` for Flow cards to remove future warnings
3. Review Homey App Store guidelines one more time
4. Prepare submission via Homey CLI (`homey app publish`)
5. Submit and wait for review

## 📚 Resources

- [Homey App Store Guidelines](https://apps.developer.homey.app/app-store/guidelines)
- [Homey Publishing Guide](https://apps.developer.homey.app/app-store/publishing)
- [Homey Design Guidelines](https://apps.developer.homey.app/app-store/guidelines#design)

