import { renderToString } from 'react-dom/server';
import Layout from './Layout.jsx';
import { loaders, allRoutes } from './pages.js';
import { meta } from './data/meta.js';
export { allRoutes, meta };
export async function render(route) {
  const Page = (await loaders[route]()).default;
  return renderToString(<Layout route={route} navigate={() => {}}><Page /></Layout>);
}
