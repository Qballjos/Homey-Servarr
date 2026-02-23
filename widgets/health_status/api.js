'use strict';

module.exports = {
  async getDeviceData({ homey, query }) {
    try {
      const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
      if (deviceIds.length === 0) {
        return { healthSummary: {} };
      }
      
      const device = await homey.homey.devices.getDevice({ id: deviceIds[0] });
      if (!device) {
        return { healthSummary: {} };
      }
      
      const healthSummary = await device.getStoreValue('health_summary') || {};
      
      return { healthSummary };
    } catch (error) {
      homey.app.log('Error in health_status widget API:', error);
      return { healthSummary: {} };
    }
  }
};
