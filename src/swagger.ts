import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import swaggerDocument from './swagger-output.json';

export const setupSwagger = (app: Express) => {
  const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.min.css';
  const JS_BUNDLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js';
  const JS_PRESET_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js';

  // Intercept static assets that swagger-ui-express tries to load locally
  app.get('/docs/swagger-ui.css', (req, res) => res.redirect(CSS_URL));
  app.get('/docs/swagger-ui-bundle.js', (req, res) => res.redirect(JS_BUNDLE_URL));
  app.get('/docs/swagger-ui-standalone-preset.js', (req, res) => res.redirect(JS_PRESET_URL));

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCssUrl: CSS_URL,
      customJs: [JS_BUNDLE_URL, JS_PRESET_URL],
    }),
  );
};
