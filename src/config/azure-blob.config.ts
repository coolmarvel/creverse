import { registerAs } from '@nestjs/config';

export default registerAs('azure-blob', () => ({
  accountName: process.env.AZURE_ACCOUNT_NAME,
  accountKey: process.env.AZURE_ACCOUNT_KEY,
  containerString: process.env.AZURE_CONNECTION_STRING,
  containerName: process.env.AZURE_CONTAINER,
}));
