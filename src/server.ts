import 'dotenv/config';
import app from './app';

const port = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

let server: any;
if (!process.env.VERCEL) {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

export default app;
