import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';

const openapi = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));

const router = express.Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(openapi));

export default router;
