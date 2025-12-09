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
          manual_refresh_only: data.manual_refresh_only || false,
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

    // Test connections without creating the device yet
    session.setHandler('testConnection', async (data) => {
      const results = [];
      const tests = [];
      const configs = [
        { enabled: data.radarr_enabled, url: data.radarr_url, port: data.radarr_port || 7878, key: data.radarr_api_key, app: 'radarr' },
        { enabled: data.sonarr_enabled, url: data.sonarr_url, port: data.sonarr_port || 8989, key: data.sonarr_api_key, app: 'sonarr' },
        { enabled: data.lidarr_enabled, url: data.lidarr_url, port: data.lidarr_port || 8686, key: data.lidarr_api_key, app: 'lidarr' },
      ];

      for (const cfg of configs) {
        if (!cfg.enabled || !cfg.url || !cfg.key) continue;
        try {
          const client = new ServarrAPI({
            baseUrl: cfg.url,
            port: cfg.port,
            apiKey: cfg.key,
            appName: cfg.app,
          });
          tests.push(
            client.testConnection().then((ok) => ({
              app: cfg.app,
              success: ok === true,
            })).catch((err) => ({
              app: cfg.app,
              success: false,
              error: err.message,
            }))
          );
        } catch (err) {
          results.push({ app: cfg.app, success: false, error: err.message });
        }
      }

      if (tests.length) {
        results.push(...(await Promise.all(tests)));
      }

      if (results.length === 0) {
        return [{ app: 'none', success: false, error: 'No enabled apps to test' }];
      }

      return results;
    });
  }

}

module.exports = ServarrHubDriver;

