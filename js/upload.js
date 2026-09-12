const uploadForm = document.getElementById("upload-form");
const imageInput = document.getElementById("room-image");
const imagePreview = document.getElementById("image-preview");
const uploadMessage = document.getElementById("upload-message");
const uploadDropZone = document.getElementById("upload-drop-zone");
const uploadFileInfo = document.getElementById("upload-file-info");
const uploadSubmit = document.getElementById("upload-submit");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1800;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

function showUploadMessage(text, type = "") {
  if (!uploadMessage) return;
  uploadMessage.textContent = text;
  uploadMessage.className = `upload-message ${type}`;
}
function formatFileSize(bytes) {
  return bytes < 1048576
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1048576).toFixed(2)} MB`;
}
function validateImage(file) {
  if (!file) return "Choose a room photo to continue.";
  if (!ALLOWED_TYPES.includes(file.type))
    return "Please use a JPG or PNG image.";
  if (file.size > MAX_FILE_SIZE) return "Your image must be 5 MB or smaller.";
  return "";
}
function showFile(file) {
  const error = validateImage(file);
  if (uploadFileInfo)
    uploadFileInfo.textContent = file
      ? `${file.name} • ${formatFileSize(file.size)}`
      : "";
  if (error) {
    imagePreview.hidden = true;
    showUploadMessage(error, "error");
    if (uploadSubmit) uploadSubmit.disabled = true;
    return;
  }
  const url = URL.createObjectURL(file);
  imagePreview.src = url;
  imagePreview.hidden = false;
  imagePreview.onload = () => URL.revokeObjectURL(url);
  if (uploadSubmit) uploadSubmit.disabled = false;
  showUploadMessage("Photo ready. Continue to the room editor.", "success");
}
function handleFile(file) {
  if (!file) return;
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    imageInput.files = dt.files;
  } catch {}
  showFile(file);
}
imageInput?.addEventListener("change", () => handleFile(imageInput.files[0]));
uploadDropZone?.addEventListener("click", () => imageInput?.click());
uploadDropZone?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    imageInput?.click();
  }
});
["dragenter", "dragover"].forEach((name) =>
  uploadDropZone?.addEventListener(name, (e) => {
    e.preventDefault();
    uploadDropZone.classList.add("drag-active");
  }),
);
["dragleave", "drop"].forEach((name) =>
  uploadDropZone?.addEventListener(name, (e) => {
    e.preventDefault();
    uploadDropZone.classList.remove("drag-active");
  }),
);
uploadDropZone?.addEventListener("drop", (e) =>
  handleFile(e.dataTransfer.files[0]),
);

function processImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_IMAGE_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight),
        );
        const w = Math.max(1, Math.round(img.naturalWidth * scale)),
          h = Math.max(1, Math.round(img.naturalHeight * scale));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("File could not be read"));
    reader.readAsDataURL(file);
  });
}
uploadForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = imageInput?.files[0],
    error = validateImage(file);
  if (error) {
    showUploadMessage(error, "error");
    return;
  }
  uploadSubmit.disabled = true;
  uploadSubmit.textContent = "Preparing room…";
  try {
    const image = await processImage(file);
    await saveRoomImage(image);
    removePaintedImage();
    removeCurrentDesignMetadata();
    removeCurrentProject();
    window.location.href = "wall-selection.html";
  } catch (err) {
    console.error(err);
    showUploadMessage(
      "We couldn't process that photo. Please try another image.",
      "error",
    );
    uploadSubmit.disabled = false;
    uploadSubmit.textContent = "Continue to editor";
  }
});
if (uploadSubmit) uploadSubmit.disabled = true;
