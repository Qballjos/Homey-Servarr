'use strict';

const Homey = require('homey');

/**
 * Flow Trigger: Download Finished
 * 
 * Triggered when a download successfully completes.
 * Provides media title and app name as tags.
 */
class DownloadFinishedTrigger extends Homey.FlowCardTrigger {

  async onInit() {
    this.log('Download Finished trigger initialized');
  }

}

module.exports = DownloadFinishedTrigger;

