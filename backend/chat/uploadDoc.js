const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

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

async function UploadDocument(fileBuffer, activeChat, mimeType) {
    
    try {
        const TimeStamp = Date.now();
        const extension = mimeType.split("/")[1]; // Extract file extension
        const fileRef = ref(storage, `uploads/${activeChat}/${TimeStamp}.${extension}`);

        // Set metadata to ensure correct content type
        const metadata = {
            contentType: mimeType
        };

        await uploadBytes(fileRef, fileBuffer, metadata);
        const fileURL = await getDownloadURL(fileRef);
        console.log("File uploaded successfully. File URL:", fileURL);
        return { success: true, message: fileURL };
    } catch (error) {
        console.error("Error uploading file:", error);
        return { success: false, error: error };
    }
}
module.exports = { UploadDocument };
