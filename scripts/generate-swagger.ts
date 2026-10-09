import fs from 'fs';
import path from 'path';
import p2o from 'postman-to-openapi';
import yaml from 'js-yaml';

const postmanCollection = path.join(__dirname, '../Postman_Collection.json');
const outputPath = path.join(__dirname, '../src/swagger-output.json');

(async () => {
  try {
    // Generate OpenAPI YAML string from Postman collection
    const yamlStr = await p2o(postmanCollection, null, { defaultTag: 'General' });
    
    // Parse the YAML into a JavaScript object
    const jsonObj = yaml.load(yamlStr);
    
    // Write out the JSON
    fs.writeFileSync(outputPath, JSON.stringify(jsonObj, null, 2));
    console.log(`Swagger JSON successfully generated from Postman collection at ${outputPath}`);
  } catch (err) {
    console.error('Failed to generate Swagger JSON:', err);
    process.exit(1);
  }
})();
