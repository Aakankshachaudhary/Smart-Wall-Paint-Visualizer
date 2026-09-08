const imageInput = document.getElementById("room-image");
const imagePreview = document.getElementById("image-preview");
const uploadError = document.getElementById("upload-error");
const uploadForm = document.getElementById("upload-form");

imageInput.addEventListener("change", function () {

    const selectedFile = imageInput.files[0];

    imagePreview.innerHTML = "";
    uploadError.textContent = "";
    imagePreview.style.display = "none";

    if (!selectedFile) {
        return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(selectedFile.type)) {
        uploadError.textContent = "Please select a JPG or PNG image.";
        imageInput.value = "";
        return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
        uploadError.textContent = "Image size should be less than 5 MB.";
        imageInput.value = "";
        return;
    }

    const imageURL = URL.createObjectURL(selectedFile);

    const image = document.createElement("img");

    image.src = imageURL;
    image.alt = "Selected room preview";

    imagePreview.appendChild(image);
    imagePreview.style.display = "block";
});


uploadForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const selectedFile = imageInput.files[0];

    if (!selectedFile) {
        uploadError.textContent = "Please select a room image first.";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        saveRoomImage(reader.result);

        window.location.href = "wall-selection.html";
    };

    reader.readAsDataURL(selectedFile);
});