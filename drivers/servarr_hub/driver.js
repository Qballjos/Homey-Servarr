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
    this._healthCheckFailedTrigger = this.homey.app.healthCheckFailedTrigger;
    this._mediaAddedTrigger = this.homey.app.mediaAddedTrigger;
    this._pauseAllAction = this.homey.app.pauseAllAction;
    this._resumeAllAction = this.homey.app.resumeAllAction;
    this._pauseAppAction = this.homey.app.pauseAppAction;
    this._resumeAppAction = this.homey.app.resumeAppAction;
    this._searchMissingAction = this.homey.app.searchMissingAction;
    this._toggleMonitoredAction = this.homey.app.toggleMonitoredAction;
    
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
    
    this._resumeAppAction.registerRunListener(async (args) => {
      return await args.device.resumeAppDownloads(args.app);
    });

    this._searchMissingAction.registerRunListener(async (args) => {
      return await args.device.searchMissing(args.app);
    });
    
    this._toggleMonitoredAction.registerRunListener(async (args) => {
      return await args.device.toggleMonitoredStatus(args.app, args.title, args.monitored === 'true');
    });
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
          id: 'servarr_hub_' + Date.now()
        },
        capabilities: [
          'text_today_releases',
          'measure_queue_count',
          'measure_missing_count',
          'queue_paused',
          'measure_library_size'
        ],
        settings: {
          manual_refresh_only: false,
          radarr_enabled: false,
          radarr_url: '',
          radarr_port: 7878,
          radarr_api_key: '',
          sonarr_enabled: false,
          sonarr_url: '',
          sonarr_port: 8989,
          sonarr_api_key: '',
          lidarr_enabled: false,
          lidarr_url: '',
          lidarr_port: 8686,
          lidarr_api_key: ''
        }
      }
    ];
  }

}

module.exports = ServarrHubDriver;

