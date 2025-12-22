'use strict';

const Homey = require('homey');
const ServarrAPI = require('../../lib/ServarrAPI');

/**
 * Servarr Control Hub Driver
 * 
 * This driver manages a single device that aggregates data from multiple Servarr applications.
 * Optimized for low CPU/memory usage with efficient polling intervals.
 */
class ServarrHubDriver extends Homey.Driver {

  async onInit() {
    this.log('Servarr Hub Driver has been initialized');
    // Action handlers are now correctly registered in app.js for proper scoping.
  }

  /**
   * onPairListDevices is called when a user is adding a device.
   * Returns a list of devices available for pairing.
   */
  async onPairListDevices() {
    this.log('Listing devices for pairing');
    return [
      {
        name: 'Servarr Control Hub',
        data: {
          id: 'servarr_hub'
        }
      }
    ];
  }

}

module.exports = ServarrHubDriver;
