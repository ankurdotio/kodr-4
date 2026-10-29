/**
 * Seeds MongoDB with fake short URLs for stress testing (default 10 million).
 *
 * Usage (from the project root):
 *   docker compose run --rm seed                          # 10,000,000 urls
 *   docker compose run --rm -e SEED_COUNT=100000 seed
 *   docker compose run --rm -e SEED_RESET=true seed       # force wipe + reseed
 *
 * shortIds are deterministic: `seed_` + index in base36 (e.g. seed_0 ... seed_5yc1r).
 * The `_` can never come from generateId(), so seeded rows never clash with real ones.
 * Only { prefix, count } is written to scripts/seed-meta.json; stress.js rebuilds ids from it.
 */
import mongoose from "mongoose"
import { writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import urlModel from "../src/model/url.model.js"

// Inside compose MONGO_URI points to the `mongo` service; on the host fall back to the published port
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:8080/url-shortner"
const COUNT = Number(process.env.SEED_COUNT) || 10_000_000
const BATCH_SIZE = Number(process.env.SEED_BATCH_SIZE) || 10_000
const CONCURRENCY = Number(process.env.SEED_CONCURRENCY) || 4
const RESET = process.env.SEED_RESET === "true"
const PREFIX = "seed_"
const META_FILE = fileURLToPath(new URL("./seed-meta.json", import.meta.url))

const seedFilter = { shortId: { $regex: `^${PREFIX}` } }

function buildBatch(start, end, now) {
    const docs = new Array(end - start)
    for (let i = start; i < end; i++) {
        docs[ i - start ] = {
            shortId: PREFIX + i.toString(36),
            originalUrl: `https://example.com/seed/${i}`,
            clicks: 0,
            createdAt: now,
            updatedAt: now,
            __v: 0
        }
    }
    return docs
}

async function seed() {
    await mongoose.connect(MONGO_URI)
    console.log(`Connected to ${MONGO_URI}`)

    // Make sure the shortId index exists before inserting, otherwise reads during stress do full scans
    await urlModel.createIndexes()

    const collection = urlModel.collection
    const existing = await collection.countDocuments(seedFilter)

    if (existing === COUNT && !RESET) {
        console.log(`Already seeded with ${COUNT.toLocaleString()} urls, skipping (SEED_RESET=true to force)`)
    } else {
        if (existing) {
            console.log(`Removing ${existing.toLocaleString()} old seeded urls...`)
            await collection.deleteMany(seedFilter)
        }

        console.log(`Inserting ${COUNT.toLocaleString()} urls (batch ${BATCH_SIZE}, concurrency ${CONCURRENCY})`)
        const startedAt = Date.now()
        const now = new Date()
        let next = 0
        let inserted = 0

        const worker = async () => {
            while (next < COUNT) {
                const start = next
                const end = Math.min(start + BATCH_SIZE, COUNT)
                next = end
                await collection.insertMany(buildBatch(start, end, now), { ordered: false })
                inserted += end - start

                const secs = (Date.now() - startedAt) / 1000
                const rate = Math.round(inserted / secs)
                const eta = Math.round((COUNT - inserted) / rate)
                process.stdout.write(`\rInserted ${inserted.toLocaleString()}/${COUNT.toLocaleString()} ` +
                    `(${rate.toLocaleString()} docs/s, ETA ${eta}s)   `)
            }
        }
        await Promise.all(Array.from({ length: CONCURRENCY }, worker))
        console.log(`\nDone in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`)
    }

    await writeFile(META_FILE, JSON.stringify({ prefix: PREFIX, count: COUNT }))
    console.log(`Saved seed metadata to ${META_FILE}`)
}

seed()
    .catch((err) => {
        console.error("\nSeeding failed:", err)
        process.exitCode = 1
    })
    .finally(() => mongoose.disconnect())
