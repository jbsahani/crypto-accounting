import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const client = createClient({ url, authToken });

async function runMigrations() {
    const migrationsDir = path.join(process.cwd(), "prisma/migrations");

    if (!fs.existsSync(migrationsDir)) {
        console.log("No migrations found.");
        return;
    }

    const migrationFolders = fs
        .readdirSync(migrationsDir)
        .filter((f) => fs.lstatSync(path.join(migrationsDir, f)).isDirectory())
        .sort();

    console.log(`Found ${migrationFolders.length} migration folders.`);

    for (const folder of migrationFolders) {
        const migrationFile = path.join(migrationsDir, folder, "migration.sql");
        if (fs.existsSync(migrationFile)) {
            console.log(`Applying migration: ${folder}...`);
            const sql = fs.readFileSync(migrationFile, "utf8");

            // Split by semicolon and filter out empty strings to run statements
            // Note: This is a simple splitter. For complex SQL, more robust parsing might be needed.
            const statements = sql
                .split(";")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            for (const statement of statements) {
                try {
                    await client.execute(statement);
                } catch (err) {
                    if (err.message.includes("already exists")) {
                        console.warn(`  Statement skipped (already exists): ${statement.substring(0, 50)}...`);
                    } else {
                        console.error(`  Error in statement: ${statement}`);
                        console.error(err);
                        // We don't exit here so we can try to continue, but in a real prod env you might want to.
                    }
                }
            }
        }
    }

    console.log("Migration sync complete!");
}

runMigrations().catch(console.error);
