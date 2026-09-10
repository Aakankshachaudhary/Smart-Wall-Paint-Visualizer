const uploadForm = document.getElementById("upload-form");
const imageInput = document.getElementById("room-image");
const imagePreview = document.getElementById("image-preview");
const uploadMessage = document.getElementById("upload-message");
const uploadDropZone = document.getElementById("upload-drop-zone");
const uploadFileInfo = document.getElementById("upload-file-info");
const uploadSubmit = document.getElementById("upload-submit");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

function showUploadMessage(message, type = "") {
    if (!uploadMessage) return;

    uploadMessage.textContent = message;
    uploadMessage.className = "upload-message";

    if (type) {
        uploadMessage.classList.add(type);
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateImage(file) {
    if (!file) {
        return "Please select an image.";
    }

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

    if (!file) {
        uploadFileInfo.textContent = "";
        return;
    }

    uploadFileInfo.textContent =
        `${file.name} • ${formatFileSize(file.size)}`;
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
    if (!file) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    imageInput.files = dataTransfer.files;

    previewSelectedFile(file);
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
            imageInput.click();
        }
    });
}

if (uploadForm) {
    uploadForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const file = imageInput.files[0];
        const error = validateImage(file);

        if (error) {
            showUploadMessage(error, "error");
            return;
        }

        if (uploadSubmit) {
            uploadSubmit.disabled = true;
            uploadSubmit.textContent = "Processing...";
        }

        const reader = new FileReader();

        reader.onload = function () {
            saveRoomImage(reader.result);
            removePaintedImage();
            removeCurrentDesignMetadata();

            window.location.href = "wall-selection.html";
        };

        reader.onerror = function () {
            if (uploadSubmit) {
                uploadSubmit.disabled = false;
                uploadSubmit.textContent = "Continue";
            }

            showUploadMessage(
                "The image could not be processed. Please try again.",
                "error"
            );
        };

        reader.readAsDataURL(file);
    });
}

if (uploadSubmit) {
    uploadSubmit.disabled = true;
}
