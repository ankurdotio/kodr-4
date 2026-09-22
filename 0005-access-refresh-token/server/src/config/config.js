import dotenv from "dotenv"

dotenv.config()

function requiredValue(key) {
    const value = process.env[ key ];

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}


const config = {
    MONGO_URI: requiredValue("MONGO_URI"),
}

export default Object.freeze(config);