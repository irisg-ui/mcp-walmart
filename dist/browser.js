import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "patchright";
import { loadCookies, saveCookies } from "./session.js";
// PATCHED 2026-07-04 (original in browser.js.orig):
// - launchPersistentContext with a real profile dir so PerimeterX trust
//   (earned by solving a challenge once) persists across restarts
// - real Chrome channel when available; no spoofed UA, no JS stealth script,
//   no timezone/geolocation spoofing — mismatches were bot signals
// - always headful: headless is Walmart's strongest bot signal, and a visible
//   window lets the user solve a challenge when one appears
// - withPage detects the "Robot or human?" page and leaves it open to solve
const PROFILE_DIR = path.join(os.homedir(), ".striderlabs", "walmart", "profile");
let contextInstance = null;
export async function getBrowserContext(_headless = true) {
    if (contextInstance)
        return contextInstance;
    const firstRun = !fs.existsSync(path.join(PROFILE_DIR, "Default"));
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
    const opts = {
        headless: false,
        viewport: null,
        args: ["--disable-blink-features=AutomationControlled", "--window-size=1280,900"],
    };
    try {
        contextInstance = await chromium.launchPersistentContext(PROFILE_DIR, { ...opts, channel: "chrome" });
    }
    catch {
        contextInstance = await chromium.launchPersistentContext(PROFILE_DIR, opts);
    }
    // One-time migration: seed the new profile with the session saved under
    // the old cookies.json scheme
    if (firstRun) {
        const cookies = loadCookies();
        if (cookies && cookies.length > 0) {
            await contextInstance.addCookies(cookies);
        }
    }
    return contextInstance;
}
export async function getPage() {
    const ctx = await getBrowserContext();
    return ctx.newPage();
}
export async function saveSessionCookies() {
    if (!contextInstance)
        return;
    const cookies = await contextInstance.cookies();
    saveCookies(cookies);
}
export async function closeBrowser() {
    if (contextInstance) {
        await saveSessionCookies();
        await contextInstance.close();
        contextInstance = null;
    }
}
async function looksChallenged(page) {
    try {
        if (/blocked/i.test(page.url()))
            return true;
        const txt = await page.evaluate(() => document.body?.innerText?.slice(0, 3000) || "");
        return /robot or human|verify you are a human|press & hold|press and hold/i.test(txt);
    }
    catch {
        return false;
    }
}
export async function withPage(fn, _headless = true) {
    const ctx = await getBrowserContext();
    const page = await ctx.newPage();
    try {
        const result = await fn(page);
        await saveSessionCookies();
        await page.close();
        return result;
    }
    catch (e) {
        if (await looksChallenged(page)) {
            // Leave the tab open so the user can solve the challenge there
            throw new Error("Walmart is showing a 'Robot or human?' challenge. Solve it in the open browser window, then retry this tool call.");
        }
        await page.close().catch(() => { });
        throw e;
    }
}
export async function navigateToWalmart(page, path = "/") {
    const url = `https://www.walmart.com${path}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);
}
//# sourceMappingURL=browser.js.map
