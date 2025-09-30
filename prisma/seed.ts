import { runAllSeeds } from './seeds';

async function main() {
  try {
    await runAllSeeds();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();
