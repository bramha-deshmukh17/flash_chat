const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE,
    messagingSenderId: process.env.FB_MESSAGE_SENDERID,
    appId: process.env.FB_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

async function UploadDocument(fileBuffer, chatId, mimeType) {
    try {
        // Check file size before processing
        if (fileBuffer.length > MAX_FILE_SIZE) {
            throw new Error("File size exceeds 5MB. Upload a smaller file.");
        }

        const TimeStamp = Date.now();
        const extension = mimeType.split("/")[1]; // Extract file extension
        const fileRef = ref(storage, `uploads/${chatId}/${TimeStamp}.${extension}`);

        // Set metadata to ensure correct content type
        const metadata = { contentType: mimeType };

        await uploadBytes(fileRef, fileBuffer, metadata);
        const fileURL = await getDownloadURL(fileRef);

        return { success: true, message: fileURL };
    } catch (error) {
        console.error("Error uploading file:", error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { UploadDocument };
