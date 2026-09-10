const uploadForm = document.getElementById("upload-form");
const imageInput = document.getElementById("room-image");
const imagePreview = document.getElementById("image-preview");
const uploadMessage = document.getElementById("upload-message");

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

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    const error = validateImage(file);

    if (error) {
        imagePreview.hidden = true;
        showUploadMessage(error, "error");
        return;
    }

    const previewUrl = URL.createObjectURL(file);

    imagePreview.onload = function () {
        URL.revokeObjectURL(previewUrl);
    };

    imagePreview.src = previewUrl;
    imagePreview.hidden = false;

    showUploadMessage("Image is ready to use.", "success");
});

uploadForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const file = imageInput.files[0];
    const error = validateImage(file);

    if (error) {
        showUploadMessage(error, "error");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        saveRoomImage(reader.result);
        removePaintedImage();
        removeCurrentDesignMetadata();

        window.location.href = "wall-selection.html";
    };

    reader.onerror = function () {
        showUploadMessage("The image could not be processed. Please try again.", "error");
    };

    reader.readAsDataURL(file);
});
