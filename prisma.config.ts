import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        // Use direct connection for migrations (port 5432)
        // url: env('DIRECT_URL'),
        url: env('DATABASE_URL'),
        // url: process.env.DATABASE_URL,
    },
})