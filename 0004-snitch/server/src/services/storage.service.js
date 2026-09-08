import ImageKit from '@imagekit/nodejs';
import config from "../config/config.js"

const client = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
})


/**
 * Uploads a file to imagekit and return the public URL of the file.
 * @param {string} file - Base64 encoded file.
 * @param {string} fileName - Name of the file.
 * @returns {Promise<string>} - Public URL of the uploaded file.
 */
export async function uploadFile(file, fileName) {

    const response = await client.files.upload({
        file,
        fileName,
        folder: "/snitch"
    })

    return response
}