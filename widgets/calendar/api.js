'use strict';

module.exports = {
  async getDeviceData({ homey, query }) {
    const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
    if (deviceIds.length === 0) {
      return { calendarData: [] };
    }
    
    try {
      const device = await homey.app.homey.devices.getDevice({ id: deviceIds[0] });
      if (!device) {
        return { calendarData: [] };
      }
      
      const calendarData = await device.getStoreValue('calendar_data') || [];
      
      return { calendarData };
    } catch (error) {
      homey.app.log('Error in widget API:', error);
      return { calendarData: [] };
    }
  }
};
