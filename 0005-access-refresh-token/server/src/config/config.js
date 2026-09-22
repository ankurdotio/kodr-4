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
    ACCESS_TOKEN_SECRET: requiredValue("ACCESS_TOKEN_SECRET"),
    REFRESH_TOKEN_SECRET: requiredValue("REFRESH_TOKEN_SECRET"),
}

export default Object.freeze(config);