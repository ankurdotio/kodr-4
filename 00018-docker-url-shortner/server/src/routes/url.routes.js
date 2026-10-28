import { Router } from "express"
import urlModel from "../model/url.model.js"
import redis from "../config/redis.js"
import { validateUrl } from "../validator/url.validator.js"
import { generateId } from "../utils/id.utils.js"
import { rateLimit } from "express-rate-limit"

const router = Router()


const getLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
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
    const shortUrlId = generateId()

    const url = await urlModel.create({
        originalUrl,
        shortUrlId
    })

    res.status(201).json(url)
})


/**
 * @method GET
 * @route /api/url/:shortUrlId
 * @description redirect to the original URL for a given shortened URL ID
 * @access Public
 * @param { shortUrlId: string } The ID of the shortened URL
 */
router.get("/:shortUrlId", getLimiter, async (req, res) => {
    const { shortUrlId } = req.params

    const urlCache = await redis.get(`url:${shortUrlId}`)

    if (urlCache) {
        if (urlCache === "__NULL__") {
            return res.status(404).json({ message: "URL not found" })
        }

        const data = JSON.parse(urlCache)
        return res.redirect(302, data.originalUrl)
    }

    const url = await urlModel.findOne({ shortUrlId })
    if (!url) {
        await redis.set(`url:${shortUrlId}`, "__NULL__", "EX", 15)
        return res.status(404).json({ message: "URL not found" })
    }

    await redis.set(`url:${shortUrlId}`, JSON.stringify(url), "EX", 5 * 60)
    res.redirect(302, url.originalUrl)

})



export default router