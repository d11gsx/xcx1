'use strict';

module.exports = ({ strapi }) => {
  return {
    routes: [
      {
        method: 'GET',
        path: '/start',
        handler: 'crawler.start',
        config: { auth: false },
      },
    ],
  };
};