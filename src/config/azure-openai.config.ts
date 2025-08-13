import { registerAs } from '@nestjs/config';

export default registerAs('azure-openai', () => ({
  endpointUrl: process.env.AZURE_ENDPOINT_URL,
  endpointKey: process.env.AZURE_ENDPOINT_KEY,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
}));
