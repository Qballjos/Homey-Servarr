'use strict';

const Homey = require('homey');

/**
 * Servarr Flow Control App
 * 
 * Main app entry point. Initializes the app and sets up global error handling.
 */
class ServarrFlowControlApp extends Homey.App {

  async onInit() {
    this.log('Servarr Flow Control App is running...');
    
    // Register Flow Triggers
    this.downloadFinishedTrigger = this.homey.flow.getTriggerCard('download_finished');
    this.queueEmptyTrigger = this.homey.flow.getTriggerCard('queue_empty');
    this.healthCheckFailedTrigger = this.homey.flow.getTriggerCard('health_check_failed');
    this.mediaAddedTrigger = this.homey.flow.getTriggerCard('media_added');
    
    // Flow Actions
    this.pauseAllAction = this.homey.flow.getActionCard('pause_all');
    this.resumeAllAction = this.homey.flow.getActionCard('resume_all');
    this.pauseAppAction = this.homey.flow.getActionCard('pause_app');
    this.resumeAppAction = this.homey.flow.getActionCard('resume_app');
    this.searchMissingAction = this.homey.flow.getActionCard('search_missing');
    this.toggleMonitoredAction = this.homey.flow.getActionCard('toggle_monitored');
    
    this.log('Flow cards registered successfully');
  }

}

module.exports = ServarrFlowControlApp;

