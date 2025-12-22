'use strict';

const Homey = require('homey');

/**
 * Servarr Control Hub App
 * 
 * Main app entry point. Initializes the app and sets up global error handling.
 */
class ServarrControlHubApp extends Homey.App {

  async onInit() {
    this.log('Servarr Control Hub App is running...');
    
    // Make device-scoped triggers available to the driver/device instances
    this.downloadFinishedTrigger = this.homey.flow.getDeviceTriggerCard('download_finished');
    this.queueEmptyTrigger = this.homey.flow.getDeviceTriggerCard('queue_empty');
    this.healthCheckFailedTrigger = this.homey.flow.getDeviceTriggerCard('health_check_failed');
    this.mediaAddedTrigger = this.homey.flow.getDeviceTriggerCard('media_added');

    this.log('Flow cards registered successfully');

    // Register Flow Action Handlers
    this.homey.flow.getActionCard('pause_all')
      .registerRunListener(async (args) => {
        return await args.device.pauseAllDownloads();
      });

    this.homey.flow.getActionCard('resume_all')
      .registerRunListener(async (args) => {
        return await args.device.resumeAllDownloads();
      });

    this.homey.flow.getActionCard('pause_app')
      .registerRunListener(async (args) => {
        return await args.device.pauseAppDownloads(args.app.id);
      });

    this.homey.flow.getActionCard('resume_app')
      .registerRunListener(async (args) => {
        return await args.device.resumeAppDownloads(args.app.id);
      });

    this.homey.flow.getActionCard('search_missing')
      .registerRunListener(async (args) => {
        return await args.device.searchMissing(args.app.id);
      });

    this.homey.flow.getActionCard('toggle_monitored')
      .registerRunListener(async (args) => {
        const monitored = args.monitored === 'true';
        return await args.device.toggleMonitoredStatus(args.app.id, args.title, monitored);
      });
  }

}

module.exports = ServarrControlHubApp;
