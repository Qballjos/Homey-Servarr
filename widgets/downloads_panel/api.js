'use strict';

module.exports = {
  async getDeviceData({ homey, query }) {
    const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
    if (deviceIds.length === 0) {
      return { queueItems: [], queueAppCounts: {}, errors: {} };
    }
    
    try {
      const device = await homey.app.homey.devices.getDevice({ id: deviceIds[0] });
      if (!device) {
        return { queueItems: [], queueAppCounts: {}, errors: {} };
      }
      
      const queueItems = await device.getStoreValue('queue_items') || [];
      const queueAppCounts = await device.getStoreValue('queue_app_counts') || { radarr: 0, sonarr: 0, lidarr: 0 };
      const errors = await device.getStoreValue('app_errors') || {};
      
      return { queueItems, queueAppCounts, errors };
    } catch (error) {
      homey.app.log('Error in widget API:', error);
      return { queueItems: [], queueAppCounts: {}, errors: {} };
    }
  },
  
  async pause({ homey, body }) {
    const { deviceId } = body;
    if (!deviceId) throw new Error('Device ID required');
    
    const device = await homey.app.homey.devices.getDevice({ id: deviceId });
    if (!device) throw new Error('Device not found');
    
    await device.pauseAllDownloads();
    return { success: true };
  },
  
  async resume({ homey, body }) {
    const { deviceId } = body;
    if (!deviceId) throw new Error('Device ID required');
    
    const device = await homey.app.homey.devices.getDevice({ id: deviceId });
    if (!device) throw new Error('Device not found');
    
    await device.resumeAllDownloads();
    return { success: true };
  },
  
  async remove({ homey, body }) {
    const { deviceId, app, id, blocklist } = body;
    if (!deviceId || !app || !id) throw new Error('Missing parameters');
    
    const device = await homey.app.homey.devices.getDevice({ id: deviceId });
    if (!device) throw new Error('Device not found');
    
    await device.removeQueueItem(app, id, { blocklist: !!blocklist });
    return { success: true };
  },
  
  async refresh({ homey, body }) {
    const { deviceId, app } = body;
    if (!deviceId || !app) throw new Error('Missing parameters');
    
    const device = await homey.app.homey.devices.getDevice({ id: deviceId });
    if (!device) throw new Error('Device not found');
    
    await device.refreshApp(app);
    return { success: true };
  }
};
