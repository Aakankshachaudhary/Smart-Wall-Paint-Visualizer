function saveRoomImage(imageData) {
    sessionStorage.setItem("roomImage", imageData);
}

function getRoomImage() {
    return sessionStorage.getItem("roomImage");
}

function removeRoomImage() {
    sessionStorage.removeItem("roomImage");
}