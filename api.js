'use strict';

const APP_COLORS = {
  radarr: '#FFC107', // Yellow
  sonarr: '#2196F3', // Blue
  lidarr: '#4CAF50',  // Green
  prowlarr: '#9C27B0', // Purple
};

/**
 * Fetches calendar events from the enabled Servarr applications.
 * @param {object} homey - The Homey instance for logging and device access.
 * @param {string} view - The calendar view ('day', 'week', 'month').
 * @returns {Promise<Array>} A promise that resolves to an array of calendar events.
 */
async function getCalendarEvents(homey, view) {
  try {
    const driver = homey.drivers.getDriver('servarr_hub');
    const devices = driver.getDevices();
    const servarrDevice = devices[0]; // Assuming only one hub device

    if (!servarrDevice) {
      homey.app.log('[API] No Servarr Hub device found.');
      return [];
    }

    // Retrieve the calendar data that device.js has already fetched and stored.
    const storedData = await servarrDevice.getStoreValue('calendar_data');
    if (!storedData || !Array.isArray(storedData)) {
      homey.app.log('[API] No calendar data found in device store.');
      return [];
    }

    // Define start and end dates based on the view
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    let end = new Date(start);

    switch (view) {
      case 'day':
        end.setDate(start.getDate() + 1);
        break;
      case 'month':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'week':
      default:
        end.setDate(start.getDate() + 7);
        break;
    }

    const startTime = start.getTime();
    const endTime = end.getTime();

    // Filter and transform the stored data for the widget
    const widgetEvents = storedData
      .filter(item => {
        const itemTime = item.timestamp;
        return itemTime >= startTime && itemTime < endTime;
      })
      .map((item, index) => {
        const event = {
          id: `${item.app}-${item.timestamp}-${index}`,
          title: item.title,
          start: item.date, // YYYY-MM-DD format from store
          color: APP_COLORS[item.app] || '#808080', // Default to grey
          isAllDay: true,
        };

        if (item.hasFile) {
          event.title = `✓ ${event.title}`;
        }
        return event;
      });

    return widgetEvents;
  } catch (error) {
    homey.app.error('[API] Error getting calendar events:', error);
    return [];
  }
}

/**
 * Helper to get the hub device.
 */
async function getHubDevice(homey) {
  const driver = homey.drivers.getDriver('servarr_hub');
  const devices = driver.getDevices();
  return devices[0];
}

module.exports = [
  {
    method: 'GET',
    path: '/widgets/calendar',
    fn: async ({ homey, query }) => {
      const view = query.calendar_view || 'week';
      return getCalendarEvents(homey, view);
    },
  },
  {
    method: 'GET',
    path: '/widgets/health',
    fn: async ({ homey }) => {
      const device = await getHubDevice(homey);
      if (!device) return { healthSummary: {} };
      const healthSummary = await device.getStoreValue('health_summary') || {};
      return { healthSummary };
    },
  },
  {
    method: 'GET',
    path: '/widgets/library',
    fn: async ({ homey }) => {
      const device = await getHubDevice(homey);
      if (!device) return { librarySize: 0 };
      const librarySize = await device.getCapabilityValue('measure_library_size');
      return { librarySize };
    },
  },
  {
    method: 'GET',
    path: '/widgets/queue',
    fn: async ({ homey }) => {
      const device = await getHubDevice(homey);
      if (!device) return { queueItems: [], queueAppCounts: {}, errors: {} };
      const queueItems = await device.getStoreValue('queue_items') || [];
      const queueAppCounts = await device.getStoreValue('queue_app_counts') || { radarr: 0, sonarr: 0, lidarr: 0 };
      const errors = await device.getStoreValue('app_errors') || {};
      return { queueItems, queueAppCounts, errors };
    },
  },
  {
    method: 'GET',
    path: '/widgets/agenda',
    fn: async ({ homey }) => {
      const device = await getHubDevice(homey);
      if (!device) return { releases: [], appReleaseCounts: {}, appMissingCounts: {}, errors: {} };
      const releases = await device.getStoreValue('today_releases') || [];
      const appReleaseCounts = await device.getStoreValue('app_release_counts') || { radarr: 0, sonarr: 0, lidarr: 0 };
      const appMissingCounts = await device.getStoreValue('app_missing_counts') || { radarr: 0, sonarr: 0, lidarr: 0 };
      const errors = await device.getStoreValue('app_errors') || {};
      return { releases, appReleaseCounts, appMissingCounts, errors };
    },
  },
  {
    method: 'POST',
    path: '/widgets/queue/pause',
    fn: async ({ homey }) => {
      const device = await getHubDevice(homey);
      if (!device) throw new Error('Device not found');
      await device.pauseAllDownloads();
      return { success: true };
    },
  },
  {
    method: 'POST',
    path: '/widgets/queue/resume',
    fn: async ({ homey }) => {
      const device = await getHubDevice(homey);
      if (!device) throw new Error('Device not found');
      await device.resumeAllDownloads();
      return { success: true };
    },
  },
  {
    method: 'POST',
    path: '/widgets/queue/refresh',
    fn: async ({ homey, body }) => {
      const device = await getHubDevice(homey);
      if (!device) throw new Error('Device not found');
      const { app } = body;
      if (!app) throw new Error('Missing parameters');
      await device.refreshApp(app);
      return { success: true };
    },
  },
  // Legacy root fallback for backward compatibility if needed, but updated to use unique sub-paths
  {
    method: 'GET',
    path: '/',
    fn: async ({ homey, query }) => {
      const view = query.calendar_view || 'week';
      return getCalendarEvents(homey, view);
    },
  },
];