const canvas = document.getElementById("wallCanvas");
const ctx = canvas.getContext("2d");

const roomImage = sessionStorage.getItem("roomImage");


const startSelectionButton =
    document.getElementById("start-selection");

const clearSelectionButton =
    document.getElementById("clear-selection");

const selectionStatus =
    document.getElementById("selection-status");

let isSelecting = false;
let selectedPoints = [];
startSelectionButton.addEventListener("click", function () {

    isSelecting = true;
    selectedPoints = [];

    selectionStatus.textContent =
        "Selection mode is active. Click points around the wall.";
});

console.log("Canvas:", canvas);
console.log("Stored image:", roomImage);

if (roomImage) {

    const image = new Image();

    image.onload = function () {

        console.log("Image loaded successfully");

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);
    };

    image.onerror = function () {
        console.log("Image could not be loaded");
    };

    image.src = roomImage;

} else {

    console.log("No image found in sessionStorage");

}

canvas.addEventListener("click", function (event) {

    if (!isSelecting) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    selectedPoints.push({
        x: x,
        y: y
    });
     drawSelection();
    console.log("Selected point:", x, y);
});

function drawSelection() {

    if (selectedPoints.length === 0) {
        return;
    }

    ctx.beginPath();

    ctx.moveTo(
        selectedPoints[0].x,
        selectedPoints[0].y
    );

    for (let i = 1; i < selectedPoints.length; i++) {

        ctx.lineTo(
            selectedPoints[i].x,
            selectedPoints[i].y
        );
    }

    ctx.stroke();
}