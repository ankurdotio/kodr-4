import { Router } from "express"
import urlModel from "../model/url.model.js"
import redis from "../config/redis.js"
import { validateUrl } from "../validator/url.validator.js"
import { generateId } from "../utils/id.utils.js"
import { rateLimit } from "express-rate-limit"
import config from "../config/config.js"

const router = Router()


const getLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    skip: () => config.URL_STRESS_TEST_MODE === "true",
})

const setLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
})



/**
 * @method POST
 * @route /api/url
 * @description Create a new shortened URL, Check the original URL is not of our own domain and must be a valid URL http/https
 * @access Public
 * @body { originalUrl: string } The original URL to shorten
 */
router.post("/", setLimiter, validateUrl, async (req, res) => {
    const { originalUrl } = req.body
    const shortUrlId = await generateId()

    const url = await urlModel.create({
        originalUrl,
        shortId: shortUrlId
    })

    res.status(201).json(url)
})


/**
 * @method GET
 * @route /api/url/:shortId
 * @description redirect to the original URL for a given shortened URL ID
 * @access Public
 * @param { shortId: string } The ID of the shortened URL
 */
router.get("/:shortId", getLimiter, async (req, res) => {
    const { shortId } = req.params

    const urlCache = await redis.get(`url:${shortId}`)

    if (urlCache) {
        if (urlCache === "__NULL__") {
            return res.status(404).json({ message: "URL not found" })
        }

        const data = JSON.parse(urlCache)

        res.redirect(302, data.originalUrl)
        await redis.hincrby("url_count", shortId, 1)
        return
    }

    const url = await urlModel.findOne({ shortId })
    if (!url) {
        await redis.set(`url:${shortId}`, "__NULL__", "EX", 15)
        return res.status(404).json({ message: "URL not found" })
    }

    await redis.set(`url:${shortId}`, JSON.stringify(url), "EX", 5 * 60)
    res.redirect(302, url.originalUrl)
    await redis.hincrby("url_count", shortId, 1)

})



export default router