'use strict';

const Homey = require('homey');

/**
 * Flow Action: Pause App Downloads
 * 
 * Pauses downloads for a specific Servarr application.
 */
class PauseAppAction extends Homey.FlowCardAction {

  async onInit() {
    this.log('Pause App action initialized');
  }

}

module.exports = PauseAppAction;

