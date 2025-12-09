'use strict';

const Homey = require('homey');

/**
 * Flow Action: Resume All Downloads
 * 
 * Resumes downloads in all configured Servarr applications.
 */
class ResumeAllAction extends Homey.FlowCardAction {

  async onInit() {
    this.log('Resume All action initialized');
  }

}

module.exports = ResumeAllAction;

