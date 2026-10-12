import fs from "fs/promises";
import { CONFIG_DIR } from "./constant.js";
import axios from "axios"


// check the settings.json file exists in ~/.config/groqcode/
export async function checkSettingsFile() {
    const configPath = `${CONFIG_DIR}/settings.json`;
    try {
        await fs.access(configPath);
        return true;
    } catch {
        return false;
    }
}

// check of the groq API_KEY exists in settings.json
export async function checkApiKey() {

    if (!(await checkSettingsFile())) {
        return false;
    }

    const settingFilePath = `${CONFIG_DIR}/settings.json`;

    const settingsContent = await fs.readFile(settingFilePath, "utf-8");

    try {
        const settings = JSON.parse(settingsContent);
        const apiKey = settings.GROQ_API_KEY;

        if (!apiKey)
            return false;

        await axios.get("https://api.groq.com/openai/v1/models", {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        })

        return true;

    } catch (err) {
        return false;
    }

}


// save the GROQ API key to settings.json
export async function saveApiKey(apiKey) {
    // check the config directory exists
    try {
        await fs.access(CONFIG_DIR);
    } catch {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    }

    const settingFilePath = `${CONFIG_DIR}/settings.json`;
    let settings = {};
    if (await checkSettingsFile()) {
        const settingsContent = await fs.readFile(settingFilePath, "utf-8");
        settings = JSON.parse(settingsContent);
    }
    settings.GROQ_API_KEY = apiKey;
    await fs.writeFile(settingFilePath, JSON.stringify(settings, null, 4), "utf-8");
}

// get the GROQ API key from settings.json
export async function getAPIKey() {
    if (!(await checkSettingsFile())) {
        throw new Error("Settings file not found");
    }

    if (!(await checkApiKey())) {
        throw new Error("GROQ API key not found");
    }

    const settingFilePath = `${CONFIG_DIR}/settings.json`;
    const settingsContent = await fs.readFile(settingFilePath, "utf-8");
    const settings = JSON.parse(settingsContent);
    return settings.GROQ_API_KEY;
}