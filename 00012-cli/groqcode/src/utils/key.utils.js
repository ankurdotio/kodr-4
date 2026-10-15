import fs from "fs/promises";
import { CONFIG_DIR } from "./constant.js";
import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";


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
        const credentials = settings.AWS_API_CREDENTIALS;

        if (!credentials?.accessKeyId || !credentials?.secretAccessKey || !credentials?.region)
            return false;

        const client = new BedrockClient({
            region: credentials.region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
            },
        });
        await client.send(new ListFoundationModelsCommand({}));

        return true;

    } catch (err) {
        console.log(err)
        return false;
    }

}


// save the GROQ API key to settings.json
export async function saveApiKey(credentials) {
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
    settings.AWS_API_CREDENTIALS = credentials;
    await fs.writeFile(settingFilePath, JSON.stringify(settings, null, 4), "utf-8");
}

// get the AWS API credentials from settings.json
export async function getAPICredentials() {
    if (!(await checkSettingsFile())) {
        throw new Error("Settings file not found");
    }

    if (!(await checkApiKey())) {
        throw new Error("AWS API credentials not found");
    }

    const settingFilePath = `${CONFIG_DIR}/settings.json`;
    const settingsContent = await fs.readFile(settingFilePath, "utf-8");
    const settings = JSON.parse(settingsContent);
    return settings.AWS_API_CREDENTIALS;
}