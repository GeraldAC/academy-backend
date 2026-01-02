import { runAllSeeds } from './seeds';
import { defaultConfig, devConfig, testConfig } from './seeds/config';

async function main() {
  try {
    // Obtener configuración desde variable de entorno o usar default
    const env = process.env.SEED_ENV || 'default';

    let config;
    switch (env) {
      case 'dev':
        config = devConfig;
        console.log('[ ] Using DEV configuration');
        break;
      case 'test':
        config = testConfig;
        console.log('[ ] Using TEST configuration');
        break;
      default:
        config = defaultConfig;
        console.log('[ ] Using DEFAULT configuration');
    }

    await runAllSeeds(config);
    process.exit(0);
  } catch (err) {
    console.error('[ ] Seed failed:', err);
    process.exit(1);
  }
}

main();
