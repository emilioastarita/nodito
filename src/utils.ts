import * as crypto from "crypto";

export function sign(secret: string, str: string) {
    const hmac = crypto.createHmac("sha256", secret);
    return hmac.update(str).digest("hex");
}

export function randomId(): string {
    return crypto.randomBytes(3 * 4).toString("base64");
}

export function isValidUserName(name: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(name) && name.length < 15 && name.length >= 1;
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}
