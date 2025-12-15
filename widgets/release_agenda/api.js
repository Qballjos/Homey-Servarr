'use strict';

module.exports = {
  async getDeviceData({ homey, query }) {
    try {
      // Get device IDs from query (passed from widget via Homey.getDeviceIds())
      const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
      if (deviceIds.length === 0) {
        return { releases: [], appReleaseCounts: {}, appMissingCounts: {}, errors: {} };
      }
      
      // Access device via homey.homey.devices (correct SDK pattern)
      const device = await homey.homey.devices.getDevice({ id: deviceIds[0] });
      if (!device) {
        return { releases: [], appReleaseCounts: {}, appMissingCounts: {}, errors: {} };
      }
      
      const releases = await device.getStoreValue('today_releases') || [];
      const appReleaseCounts = await device.getStoreValue('app_release_counts') || { radarr: 0, sonarr: 0, lidarr: 0 };
      const appMissingCounts = await device.getStoreValue('app_missing_counts') || { radarr: 0, sonarr: 0, lidarr: 0 };
      const errors = await device.getStoreValue('app_errors') || {};
      
      return { releases, appReleaseCounts, appMissingCounts, errors };
    } catch (error) {
      homey.app.log('Error in widget API:', error);
      return { releases: [], appReleaseCounts: {}, appMissingCounts: {}, errors: {} };
    }
  }
};
