import { useState, useEffect } from "react";
import { ref, getMetadata } from "firebase/storage";
import { storage } from "../firebase"; // Adjust the path as needed
import { FaDownload } from "react-icons/fa";

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
        return <p className="text-sm text-white">Loading...</p>;
    }

    if (isImage) {
        const filename = decodeURIComponent(fileUrl.split("/").pop().split("?")[0]);
        return (
            <div className="flex flex-col items-start">
                <div className="relative">
                    {/* Download button overlaid at top-right */}
                    {imageLoading[index] === false ? (
                        <a
                            href={fileUrl}
                            className="absolute top-2 right-2 text-blue-500 hover:underline text-sm bg-white bg-opacity-75 rounded"
                            download={filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download image"
                        >
                            <FaDownload />
                        </a>
                    ) :(
                        <p className="inset-0 flex p-5 items-center justify-center text-white text-sm rounded-lg">
                            Loading...
                        </p>
                    )}
                    <img
                        src={fileUrl}
                        alt='Not found'
                        className={`rounded-lg chat-img ${imageLoading[index] === false ? "block" : "hidden"}`}
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                    />
                </div>
            </div>
        );
    }
     else {
        const file = fileUrl.split("/").pop().split('?')[0];
        const parts = decodeURIComponent(file).split("/");
        const filename = parts[parts.length - 1];
        return (
            <div className="pb-2 pt-2 rounded flex items-center space-x-2">
                <span className="text-sm font-bold">{filename}</span>
                <a
                    href={fileUrl}
                    className="text-blue-500 hover:underline text-sm"
                    download={filename}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaDownload title="Download" />
                </a>
            </div>

        );


    }
};

export default FilePreview;
