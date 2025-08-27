'use strict';

/**
 * red-envelope service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::red-envelope.red-envelope');
