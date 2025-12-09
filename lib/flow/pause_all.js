'use strict';

const Homey = require('homey');

/**
 * Flow Action: Pause All Downloads
 * 
 * Pauses downloads in all configured Servarr applications.
 */
class PauseAllAction extends Homey.FlowCardAction {

  async onInit() {
    this.log('Pause All action initialized');
  }

}

module.exports = PauseAllAction;

