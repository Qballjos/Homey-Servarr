# Installation Instructions

## Requirements

- Homey device with firmware version 12.3.0 or higher (required for widget support)
- Servarr applications (Radarr, Sonarr, Lidarr) running on any platform (Docker, native installation, Unraid, etc.)
- API keys from your Servarr applications
- Network access from Homey to your Servarr servers

## Step 1: Get API Keys

For each Servarr application you want to use:

1. Open the application in your browser
2. Go to **Settings** → **General**
3. Copy the **API Key**

## Step 2: Install App

### Option A: Via Homey Developer Console

1. Open the Homey Developer Console (via `homey developer` CLI or web interface)
2. Upload the app folder to Homey
3. Install the app via the Developer Console

### Option B: Via CLI

```bash
cd "/Users/qballjos/Documents/GitHub/Homey Servarr"
homey app install
```

## Step 3: Add Device

1. Open the Homey app on your phone
2. Go to **Apps** → **Servarr Control Hub**
3. Click **Add Device**
4. Select **Servarr Control Hub**
5. Fill in the configuration:

For each Servarr application you want to use:
- **Enable the app** with the toggle switch at the top of the section
- **Base URL**: E.g. `http://192.168.1.100` or `https://radarr.example.com` (without trailing slash)
- **Port**: Default ports are 7878 (Radarr), 8989 (Sonarr), 8686 (Lidarr)
- **API Key**: Your Servarr API key (found in Settings → General)
- **Manual refresh only** (optional): skip scheduled polling; refresh via widget button

### Radarr
- Default port: `7878`
- Enable/disable with the toggle switch

### Sonarr
- Default port: `8989`
- Enable/disable with the toggle switch

### Lidarr
- Default port: `8686`
- Enable/disable with the toggle switch

**Note**: 
- You don't need to configure all apps - only enable the apps you use
- The app works with Servarr on any platform (Docker, native, Unraid, etc.)
- You can enable/disable apps later via device settings

## Step 4: Add Widgets

1. Go to the Homey Dashboard
2. Click **Add Widget**
3. Select your **Servarr Control Hub** device
4. Choose one of the available widgets:
   - **Release Agenda Today** - Shows planned releases for today
   - **Downloads & Action Panel** - Shows queue status with pause/resume buttons

## Step 5: Use Flow Cards

### IF... Triggers

#### Download Finished
- Triggered when a download successfully completes
- Provides media title and app name as tags

#### Queue Empty
- Triggered when the queue becomes empty

#### Health Check Failed
- Triggered when Servarr reports a health warning/error

#### Media Added
- Triggered when a movie/series/album/artist is added

### THEN... Actions

#### Pause All Downloads
- Pauses downloads in all configured Servarr apps

#### Resume All Downloads
- Resumes downloads in all configured Servarr apps

#### Pause App Downloads
- Pauses downloads for a specific app (Radarr/Sonarr/Lidarr)

#### Resume App Downloads
- Resumes downloads for a specific app (Radarr/Sonarr/Lidarr)

#### Search Missing Items (per app)
- Triggers a search for missing/wanted items for the chosen app

#### Toggle Monitored Status
- Enable/disable monitoring for a specific media item by title
- Searches for the item by title and toggles its monitored status

## Troubleshooting

### App cannot connect to Servarr

1. Check if the Base URL is correct (without trailing slash)
2. Check if the port is correct
3. Check if the API key is correctly copied
4. Check if your Servarr application is accessible from your Homey

### Widgets show no data

1. Wait a few minutes (polling interval is 5 minutes)
2. Use the refresh button in the Downloads & Action Panel widget for immediate update
3. Check if the device is correctly configured
4. Verify settings are saved (check Advanced Settings)
5. Check Homey logs for error messages

### Flow Cards don't work

1. Check if the device is correctly added
2. Check if the API settings are correct
3. Check Homey logs for error messages

## Performance

The app is optimized for low resource usage:
- Polling interval: 5 minutes for queue/releases
- Extended polling: 15 minutes for health checks, missing count, and library size
- Minimal API calls (counts instead of full lists where possible)
- Efficient data caching
- Manual refresh mode: option to disable scheduled polling

For questions or problems, consult the README.md or Homey Developer documentation.
