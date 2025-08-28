'use strict';
const axios = require('axios');

module.exports = {
  async start(ctx) {
    const { url, type = 'posts' } = ctx.query;

    if (!url) {
      ctx.throw(400, '缺少 url 参数');
    }

    try {
      const res = await axios.get(url, { params: { populate: '*' } });
      const items = res.data.data;

      let inserted = [];

      for (let item of items) {
        const attrs = item.attributes || {};

        const entity = await strapi.db
          .query(`api::${type}.${type}`)
          .create({
            data: {
              title: attrs.title || '',
              description: attrs.description || '',
              content: attrs.content || '',
              version: attrs.version || '',
              cover: attrs.cover?.url || '',
            },
          });

        inserted.push(entity);
      }

      ctx.body = { ok: true, count: inserted.length, items: inserted };
    } catch (err) {
      ctx.body = { ok: false, error: err.message };
    }
  },
};