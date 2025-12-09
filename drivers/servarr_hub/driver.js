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
    
    // Get flow cards from app (they are registered in app.js)
    this._downloadFinishedTrigger = this.homey.app.downloadFinishedTrigger;
    this._queueEmptyTrigger = this.homey.app.queueEmptyTrigger;
    this._pauseAllAction = this.homey.app.pauseAllAction;
    this._resumeAllAction = this.homey.app.resumeAllAction;
    this._pauseAppAction = this.homey.app.pauseAppAction;
    
    // Register action handlers
    this._pauseAllAction.registerRunListener(async (args) => {
      return await args.device.pauseAllDownloads();
    });
    
    this._resumeAllAction.registerRunListener(async (args) => {
      return await args.device.resumeAllDownloads();
    });
    
    this._pauseAppAction.registerRunListener(async (args) => {
      return await args.device.pauseAppDownloads(args.app);
    });
  }

  /**
   * onPair is called when a user is adding a device
   */
  async onPair(session) {
    // Handle the setup view
    session.setHandler('showView', async (viewId) => {
      this.log(`Showing view: ${viewId}`);
    });
    
    // Get settings from the pair view
    session.setHandler('getSettings', async () => {
      return {};
    });
    
    // Validate and add device
    session.setHandler('add', async (data) => {
      // Validate that at least one app is enabled and configured
      const hasRadarr = data.radarr_enabled && data.radarr_url && data.radarr_api_key;
      const hasSonarr = data.sonarr_enabled && data.sonarr_url && data.sonarr_api_key;
      const hasLidarr = data.lidarr_enabled && data.lidarr_url && data.lidarr_api_key;
      
      if (!hasRadarr && !hasSonarr && !hasLidarr) {
        throw new Error('Enable at least one Servarr application and configure it');
      }
      
      // Create device with settings from pair view
      return {
        name: 'Servarr Control Hub',
        data: {
          id: 'servarr_hub_' + Date.now()
        },
        settings: {
          radarr_enabled: data.radarr_enabled || false,
          radarr_url: data.radarr_url || '',
          radarr_port: parseInt(data.radarr_port) || 7878,
          radarr_api_key: data.radarr_api_key || '',
          sonarr_enabled: data.sonarr_enabled || false,
          sonarr_url: data.sonarr_url || '',
          sonarr_port: parseInt(data.sonarr_port) || 8989,
          sonarr_api_key: data.sonarr_api_key || '',
          lidarr_enabled: data.lidarr_enabled || false,
          lidarr_url: data.lidarr_url || '',
          lidarr_port: parseInt(data.lidarr_port) || 8686,
          lidarr_api_key: data.lidarr_api_key || ''
        }
      };
    });
  }

}

module.exports = ServarrHubDriver;

