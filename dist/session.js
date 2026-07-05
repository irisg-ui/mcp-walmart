import fs from "fs";
import os from "os";
import path from "path";
const SESSION_DIR = path.join(os.homedir(), ".striderlabs", "walmart");
const COOKIES_FILE = path.join(SESSION_DIR, "cookies.json");
const AUTH_FILE = path.join(SESSION_DIR, "auth.json");
const ADDRESS_FILE = path.join(SESSION_DIR, "address.json");
export function ensureSessionDir() {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
}
export function saveCookies(cookies) {
    ensureSessionDir();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
}
export function loadCookies() {
    if (!fs.existsSync(COOKIES_FILE))
        return null;
    try {
        return JSON.parse(fs.readFileSync(COOKIES_FILE, "utf-8"));
    }
    catch {
        return null;
    }
}
export function clearCookies() {
    if (fs.existsSync(COOKIES_FILE))
        fs.unlinkSync(COOKIES_FILE);
    if (fs.existsSync(AUTH_FILE))
        fs.unlinkSync(AUTH_FILE);
}
export function saveAuth(info) {
    ensureSessionDir();
    fs.writeFileSync(AUTH_FILE, JSON.stringify(info, null, 2));
}
export function loadAuth() {
    if (!fs.existsSync(AUTH_FILE))
        return null;
    try {
        return JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    }
    catch {
        return null;
    }
}
export function isLoggedIn() {
    return fs.existsSync(COOKIES_FILE) && fs.existsSync(AUTH_FILE);
}
export function saveAddress(info) {
    ensureSessionDir();
    fs.writeFileSync(ADDRESS_FILE, JSON.stringify(info, null, 2));
}
export function loadAddress() {
    if (!fs.existsSync(ADDRESS_FILE))
        return null;
    try {
        return JSON.parse(fs.readFileSync(ADDRESS_FILE, "utf-8"));
    }
    catch {
        return null;
    }
}
export function getSessionDir() {
    return SESSION_DIR;
}
//# sourceMappingURL=session.js.map