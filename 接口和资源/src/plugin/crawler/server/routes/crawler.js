'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/start',
    handler: 'crawler.start',
    config: { auth: false },
  },
];