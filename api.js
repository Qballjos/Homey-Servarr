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

module.exports = [
  {
    method: 'GET',
    path: '/',
    fn: async ({ homey, query }) => {
      const view = query.calendar_view || 'week'; // Default to week view
      return getCalendarEvents(homey, view);
    },
  },
];