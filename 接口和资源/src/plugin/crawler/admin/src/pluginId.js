const pluginPkg = require("../../package.json");
const pluginId = pluginPkg.name.replace(/^strapi-plugin-/, "");
export default pluginId;