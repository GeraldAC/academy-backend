import app from './app';
import { env } from './config/env';
import { prisma } from './prisma/client';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('[ ] Base de datos conectada exitosamente');

    app.listen(env.PORT, () => {
      console.log(`[ ] Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('[ ] Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
