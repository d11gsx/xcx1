'use strict';

/**
 * speech service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::speech.speech');
