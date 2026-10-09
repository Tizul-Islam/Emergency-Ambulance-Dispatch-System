import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    notification: {
      async create({ args, query }) {
        const result = await query(args);
        try {
          const { getIO } = require('../socket');
          const io = getIO();
          if (io && result && result.userId) {
            io.to(result.userId).emit('notification', result);
          }
        } catch (err) {}
        return result;
      },
      async createMany({ args, query }) {
        const result = await query(args);
        try {
          const { getIO } = require('../socket');
          const io = getIO();
          if (io && args.data) {
            const arr = Array.isArray(args.data) ? args.data : [args.data];
            arr.forEach((n: any) => {
              if (n.userId) io.to(n.userId).emit('notification', n);
            });
          }
        } catch (err) {}
        return result;
      }
    }
  }
}) as unknown as PrismaClient; // Cast to base PrismaClient to maintain type compatibility if needed

export default prisma;
