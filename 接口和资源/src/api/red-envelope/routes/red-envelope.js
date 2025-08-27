'use strict';

/**
 * red-envelope router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::red-envelope.red-envelope');
