'use strict';

const Homey = require('homey');

/**
 * Flow Trigger: Queue Empty
 * 
 * Triggered when the total queue of all Servarr apps becomes empty.
 */
class QueueEmptyTrigger extends Homey.FlowCardTrigger {

  async onInit() {
    this.log('Queue Empty trigger initialized');
  }

}

module.exports = QueueEmptyTrigger;

