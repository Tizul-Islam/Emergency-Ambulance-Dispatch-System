import { getDashboardStats } from './src/modules/admin/admin.service';

getDashboardStats()
  .then((stats) => {
    console.log('Stats:', stats);
  })
  .catch((err) => {
    console.error('Error:', err);
  })
  .finally(() => process.exit(0));
