// Format a date string for chat messages
export const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

// Handle image load (for loading state)
export const handleImageLoad = (index, setImageLoading) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
};

// Handle image error (for loading state)
export const handleImageError = (index, setImageLoading) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
};

// Scroll to bottom of the chat
export const scrollToBottom = (scrollableDivRef) => {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
};

// Handle file input change
export const handleFileChange = (event, setSelectedFile, setFile, MAX_FILE_SIZE) => {
    const selected = event.target.files[0];
    if (selected) {
        if (selected.size > MAX_FILE_SIZE) {
            alert("File size exceeds 5MB. Please upload a smaller file.");
            return;
        }
        const fileUrl = URL.createObjectURL(selected);
        setSelectedFile(fileUrl);
        setFile(selected);
    }
};