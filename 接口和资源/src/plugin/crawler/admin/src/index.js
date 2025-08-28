import pluginId from "./pluginId";
import PluginIcon from "./components/PluginIcon";
import App from "./pages/App";

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: "采集工具",
      },
      Component: App,
    });
  },

  bootstrap(app) {},
};