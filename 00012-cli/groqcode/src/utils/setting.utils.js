import { currentDir } from "./constant.js";
import fs from "fs/promises"
import path from "path"



export async function checkContent(path) {
    try {
        await fs.access(path);
        return true;
    } catch (error) {
        return false;
    }
}

export async function getSettingsFIle() {

    const groqcodeDir = path.join(currentDir, ".groqcode");

    const exists = await checkContent(groqcodeDir);

    if (!exists) {
        await fs.mkdir(groqcodeDir, { recursive: true });
    }

    const settingsFile = path.join(groqcodeDir, "settings.json");

    const isSettingsFileExists = await checkContent(settingsFile);

    if (!isSettingsFileExists) {
        await fs.writeFile(settingsFile, JSON.stringify({}));
    }

    return await fs.readFile(settingsFile, "utf-8");
}

export async function getCurrentProjectSetting() {
    // check is the settings.json file exists in the current directory

    let settings = await getSettingsFIle();

    settings = JSON.parse(settings);

    return settings;
}

export async function addAllwaysAllow(toolName) {
    const settings = await getCurrentProjectSetting();

    if (!settings.allwaysAllow) {
        settings.allwaysAllow = [];
    }

    if (!settings.allwaysAllow.includes(toolName)) {
        settings.allwaysAllow.push(toolName);
    }

    const groqcodeDir = path.join(currentDir, ".groqcode");
    const settingsFile = path.join(groqcodeDir, "settings.json");
    await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
}

export async function checkAllwaysAllow(toolName) {
    const settings = await getCurrentProjectSetting();

    if (!settings.allwaysAllow) {
        return false;
    }

    return settings.allwaysAllow.includes(toolName);
}