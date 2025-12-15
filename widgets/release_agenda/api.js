'use strict';

module.exports = {
  async getDeviceData({ homey, query }) {
    const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
    if (deviceIds.length === 0) {
      return { releases: [], appReleaseCounts: {}, appMissingCounts: {}, errors: {} };
    }
    
    try {
      const device = await homey.app.homey.devices.getDevice({ id: deviceIds[0] });
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
