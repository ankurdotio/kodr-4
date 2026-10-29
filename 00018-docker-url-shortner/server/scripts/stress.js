/**
 * Stress tests GET /api/url/:shortId with autocannon.
 * Start the stack with URL_STRESS_TEST_MODE=true so the rate limiter is skipped, then
 * from the project root:
 *   docker compose run --rm seed
 *   docker compose run --rm stress
 *   docker compose run --rm -e CONNECTIONS=200 -e DURATION=60 stress
 *
 * Env options:
 *   TARGET_URL   base url of the server        (compose: http://server:3000)
 *   CONNECTIONS  concurrent connections        (default 100)
 *   DURATION     test duration in seconds      (default 30)
 *   PIPELINING   requests pipelined per conn   (default 1)
 *   MISS_RATIO   0..1 share of unknown ids     (default 0)   -> exercises the 404 / "__NULL__" cache path
 *   HOT_IDS      only use the first N ids      (default all) -> small value = mostly redis cache hits
 */
import autocannon from "autocannon"
import { readFile } from "node:fs/promises"

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000"
const CONNECTIONS = Number(process.env.CONNECTIONS) || 100
const DURATION = Number(process.env.DURATION) || 30
const PIPELINING = Number(process.env.PIPELINING) || 1
const MISS_RATIO = Number(process.env.MISS_RATIO) || 0
const HOT_IDS = Number(process.env.HOT_IDS) || 0

let meta
try {
    meta = JSON.parse(await readFile(new URL("./seed-meta.json", import.meta.url), "utf8"))
} catch {
    console.error("scripts/seed-meta.json not found. Run `docker compose run --rm seed` first.")
    process.exit(1)
}
const idCount = HOT_IDS > 0 ? Math.min(HOT_IDS, meta.count) : meta.count

// Seeded ids are `${prefix}${index.toString(36)}`, so they can be rebuilt without loading 10M ids
const pick = () => {
    if (Math.random() < MISS_RATIO) return `missing${Math.floor(Math.random() * 1e9)}`
    return meta.prefix + Math.floor(Math.random() * idCount).toString(36)
}

console.log(`Stressing ${TARGET_URL}/api/url/:shortId with ${idCount.toLocaleString()} ids, ` +
    `${CONNECTIONS} connections for ${DURATION}s (miss ratio ${MISS_RATIO})`)

const instance = autocannon({
    url: TARGET_URL,
    connections: CONNECTIONS,
    duration: DURATION,
    pipelining: PIPELINING,
    requests: [
        {
            method: "GET",
            setupRequest: (req) => ({ ...req, path: `/api/url/${pick()}` })
        }
    ]
}, (err, result) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    const { statusCodeStats = {}, non2xx, errors, timeouts } = result
    console.log("\nStatus codes:", Object.fromEntries(
        Object.entries(statusCodeStats).map(([ code, { count } ]) => [ code, count ])
    ))
    console.log({ non2xx, errors, timeouts })
})

autocannon.track(instance, { renderProgressBar: true })
process.once("SIGINT", () => instance.stop())
