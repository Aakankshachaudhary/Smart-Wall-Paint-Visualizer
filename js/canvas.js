const canvas = document.getElementById("wallCanvas");
const context = canvas.getContext("2d");

const roomImage = sessionStorage.getItem("roomImage");

console.log("Canvas:", canvas);
console.log("Stored image:", roomImage);

if (roomImage) {

    const image = new Image();

    image.onload = function () {

        console.log("Image loaded successfully");

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0);
    };

    image.onerror = function () {
        console.log("Image could not be loaded");
    };

    image.src = roomImage;

} else {

    console.log("No image found in sessionStorage");

}