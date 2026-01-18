// AES‑GCM with a key derived from a user-supplied chat password.
// Output format:
//   v1:saltBase64:ivBase64:cipherBase64

const IV_LEN = 12;   // 96-bit IV for AES‑GCM
const SALT_LEN = 16; // 128-bit salt for PBKDF2
const PBKDF2_ITERATIONS = 150000;

function toBase64(buf) {
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function fromBase64(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function deriveAesKey(passphrase, saltBytes) {
    const enc = new TextEncoder();

    const baseKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

// Encrypts `message` with a per‑chat password that NEVER leaves the client.
export async function encryptMessage(message, chatPassword) {
    if (!window?.crypto?.subtle) {
        throw new Error("Web Crypto API not available in this environment.");
    }

    if (typeof message !== "string" || typeof chatPassword !== "string") {
        throw new TypeError("message and chatPassword must be strings.");
    }

    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));

    const key = await deriveAesKey(chatPassword, salt);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(message)
    );

    // v1:salt:iv:cipher, all base64
    return [
        "v1",
        toBase64(salt),
        toBase64(iv),
        toBase64(ciphertext),
    ].join(":");
}

// Decrypts a token created by encryptMessage with the same chatPassword.
export async function decryptMessage(token, chatPassword) {
    if (!window?.crypto?.subtle) {
        throw new Error("Web Crypto API not available in this environment.");
    }

    const parts = token.split(":");
    if (parts.length !== 4 || parts[0] !== "v1") {
        throw new Error("Invalid encrypted message format.");
    }

    const [, saltB64, ivB64, cipherB64] = parts;

    const salt = fromBase64(saltB64);
    const iv = fromBase64(ivB64);
    const cipherBytes = fromBase64(cipherB64);

    const key = await deriveAesKey(chatPassword, salt);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        cipherBytes
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
}

export default { encryptMessage, decryptMessage };