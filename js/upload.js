const uploadForm = document.getElementById("upload-form");
const imageInput = document.getElementById("room-image");
const imagePreview = document.getElementById("image-preview");
const uploadMessage = document.getElementById("upload-message");
const uploadDropZone = document.getElementById("upload-drop-zone");
const uploadFileInfo = document.getElementById("upload-file-info");
const uploadSubmit = document.getElementById("upload-submit");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1800;
const IMAGE_QUALITY = 0.88;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

function showUploadMessage(message, type = "") {
    if (!uploadMessage) return;

    uploadMessage.textContent = message;
    uploadMessage.className = "upload-message";

    if (type) uploadMessage.classList.add(type);
}

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateImage(file) {
    if (!file) return "Please select an image.";
    if (!ALLOWED_TYPES.includes(file.type)) {
        return "Only JPG and PNG images are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
        return "Image size must be 5 MB or less.";
    }
    return "";
}

function updateFileInfo(file) {
    if (!uploadFileInfo) return;

    uploadFileInfo.textContent = file
        ? `${file.name} • ${formatFileSize(file.size)}`
        : "";
}

function previewSelectedFile(file) {
    const error = validateImage(file);
    updateFileInfo(file);

    if (error) {
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        showUploadMessage(error, "error");
        if (uploadSubmit) uploadSubmit.disabled = true;
        return;
    }

    const previewUrl = URL.createObjectURL(file);

    imagePreview.onload = function () {
        URL.revokeObjectURL(previewUrl);
    };

    imagePreview.onerror = function () {
        URL.revokeObjectURL(previewUrl);
        imagePreview.hidden = true;
        showUploadMessage("The image preview could not be loaded.", "error");
    };

    imagePreview.src = previewUrl;
    imagePreview.hidden = false;

    showUploadMessage("Image is ready to use.", "success");
    if (uploadSubmit) uploadSubmit.disabled = false;
}

function handleFile(file) {
    if (!file || !imageInput) return;

    try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;
    } catch (error) {
        console.warn("Could not mirror dropped file into the input:", error);
    }

    previewSelectedFile(file);
}

function readAndOptimizeImage(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            const image = new Image();

            image.onload = function () {
                const scale = Math.min(
                    1,
                    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
                );

                const width = Math.max(1, Math.round(image.naturalWidth * scale));
                const height = Math.max(1, Math.round(image.naturalHeight * scale));

                const processingCanvas = document.createElement("canvas");
                processingCanvas.width = width;
                processingCanvas.height = height;

                const processingContext = processingCanvas.getContext("2d");

                if (!processingContext) {
                    reject(new Error("Canvas processing is not supported."));
                    return;
                }

                processingContext.drawImage(image, 0, 0, width, height);

                // JPEG keeps the working image small enough for browser storage
                // while retaining enough quality for a room visualization.
                resolve(
                    processingCanvas.toDataURL(
                        "image/jpeg",
                        IMAGE_QUALITY
                    )
                );
            };

            image.onerror = function () {
                reject(new Error("The selected image could not be decoded."));
            };

            image.src = reader.result;
        };

        reader.onerror = function () {
            reject(new Error("The selected image could not be read."));
        };

        reader.readAsDataURL(file);
    });
}

if (imageInput) {
    imageInput.addEventListener("change", function () {
        handleFile(imageInput.files[0]);
    });
}

if (uploadDropZone) {
    ["dragenter", "dragover"].forEach(function (eventName) {
        uploadDropZone.addEventListener(eventName, function (event) {
            event.preventDefault();
            uploadDropZone.classList.add("drag-active");
        });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
        uploadDropZone.addEventListener(eventName, function (event) {
            event.preventDefault();
            uploadDropZone.classList.remove("drag-active");
        });
    });

    uploadDropZone.addEventListener("drop", function (event) {
        handleFile(event.dataTransfer.files[0]);
    });

    uploadDropZone.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            imageInput?.click();
        }
    });
}

if (uploadForm) {
    uploadForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const file = imageInput?.files[0];
        const error = validateImage(file);

        if (error) {
            showUploadMessage(error, "error");
            return;
        }

        if (uploadSubmit) {
            uploadSubmit.disabled = true;
            uploadSubmit.textContent = "Preparing image...";
        }

        try {
            const optimizedImage = await readAndOptimizeImage(file);

            saveRoomImage(optimizedImage);
            removePaintedImage();
            removeCurrentDesignMetadata();
            removeCurrentSelection();

            window.location.href = "wall-selection.html";
        } catch (processingError) {
            console.error("Could not process image:", processingError);

            if (uploadSubmit) {
                uploadSubmit.disabled = false;
                uploadSubmit.textContent = "Continue";
            }

            showUploadMessage(
                "The image could not be processed. Please try another JPG or PNG.",
                "error"
            );
        }
    });
}

if (uploadSubmit) uploadSubmit.disabled = true;
