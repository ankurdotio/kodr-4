import { customAlphabet } from "nanoid"
import urlModel from "../model/url.model.js"

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

export const generateId = async () => {
    let id
    do {
        id = customAlphabet(alphabet, 7)()
    } while (await urlModel.exists({ shortId: id }))
    return id
}