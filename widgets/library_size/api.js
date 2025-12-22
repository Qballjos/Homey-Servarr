'use strict';

module.exports = {
  async getDeviceData({ homey, query }) {
    try {
      const deviceIds = query.deviceIds ? query.deviceIds.split(',') : [];
      if (deviceIds.length === 0) {
        return { librarySize: 0 };
      }
      
      const device = await homey.homey.devices.getDevice({ id: deviceIds[0] });
      if (!device) {
        return { librarySize: 0 };
      }
      
      const librarySize = await device.getCapabilityValue('measure_library_size');
      
      return { librarySize };
    } catch (error) {
      homey.app.log('Error in widget API:', error);
      return { librarySize: 0 };
    }
  }
};
