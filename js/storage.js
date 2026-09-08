function saveRoomImage(imageData) {
    sessionStorage.setItem("roomImage", imageData);
}

function getRoomImage() {
    return sessionStorage.getItem("roomImage");
}

function removeRoomImage() {
    sessionStorage.removeItem("roomImage");
}
function savePaintedImage(imageData) {
    sessionStorage.setItem("paintedImage", imageData);
}

function getPaintedImage() {
    return sessionStorage.getItem("paintedImage");
}

function removePaintedImage() {
    sessionStorage.removeItem("paintedImage");
}