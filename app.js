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
    this.downloadFinishedTrigger = new Homey.FlowCardTrigger('download_finished');
    await this.downloadFinishedTrigger.register();
    
    this.queueEmptyTrigger = new Homey.FlowCardTrigger('queue_empty');
    await this.queueEmptyTrigger.register();
    
    // Register Flow Actions
    this.pauseAllAction = new Homey.FlowCardAction('pause_all');
    await this.pauseAllAction.register();
    
    this.resumeAllAction = new Homey.FlowCardAction('resume_all');
    await this.resumeAllAction.register();
    
    this.pauseAppAction = new Homey.FlowCardAction('pause_app');
    await this.pauseAppAction.register();
    
    this.log('Flow cards registered successfully');
  }

}

module.exports = ServarrFlowControlApp;

