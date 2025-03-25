import { useState, useEffect } from "react";
import { ref, getMetadata } from "firebase/storage";
import { storage } from "../firebase"; // Adjust the path as needed

// Helper function to extract the relative path from a Firebase URL
const extractStoragePath = (url) => {
    const regex = /\/o\/(.*?)\?alt=media/;
    const match = url.match(regex);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    return null;
};

const isImageFileFromURL = async (url) => {
    try {
        const relativePath = extractStoragePath(url);
        if (!relativePath) throw new Error("Could not extract path");
        const fileRef = ref(storage, relativePath);
        const metadata = await getMetadata(fileRef);
        return metadata.contentType.startsWith("image/");
    } catch (error) {
        console.error("Error checking file type:", error);
        return false;
    }
};

const FilePreview = ({ fileUrl, index, imageLoading, handleImageLoad, handleImageError }) => {
    const [isImage, setIsImage] = useState(null);

    useEffect(() => {
        if (fileUrl) {
            isImageFileFromURL(fileUrl).then((result) => setIsImage(result));
        }
    }, [fileUrl]);

    if (isImage === null) {
        return <p className="text-sm text-gray-500">Loading...</p>;
    }

    if (isImage) {
        return (
            <div className={`relative`}>
                {imageLoading[index] !== false && (
                    <p className="absolute inset-0 flex items-center justify-center text-blue-500 text-sm">
                        Loading...
                    </p>
                )}
                <img
                    src={fileUrl}
                    alt="Preview"
                    className={` rounded-lg chat-img ${imageLoading[index] === false ? "block" : "hidden"}`}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                />
            </div>
        );
    } else {
        const file = fileUrl.split("/").pop().split('?')[0];
        const parts = decodeURIComponent(file).split("/")
        return (
            <div className="p-2 rounded">
                <p className="text-sm font-bold">{parts[parts.length - 1]}</p>
                <a href={fileUrl} className="text-blue-500 underline text-sm" download={parts[parts.length - 1]} target="_blank" >
                    Download
                </a>
            </div>
        );
    }
};

export default FilePreview;
