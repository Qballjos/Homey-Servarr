'use strict';

async function getDeviceData({ homey, query }) {
  try {
    const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
    if (deviceIds.length === 0) {
      return { calendarData: [] };
    }
    
    // Access device via homey.homey.devices (correct SDK pattern)
    const device = await homey.homey.devices.getDevice({ id: deviceIds[0] });
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

module.exports = {
  getDeviceData
};

