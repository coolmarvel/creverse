import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  jwtBearerToken: process.env.JWT_BEARER_TOKEN,
  username: process.env.SWAGGER_USERNAME,
  password: process.env.SWAGGER_PASSWORD,
}));
