import redisConfig from './redis.config';
import swaggerConfig from './swagger.config';
import databaseConfig from './database.config';
import postgresConfig from './postgres.config';
import azureBlobConfig from './azure-blob.config';
import azureOpenaiConfig from './azure-openai.config';

export default [redisConfig, databaseConfig, swaggerConfig, postgresConfig, azureBlobConfig, azureOpenaiConfig];
