const canvas = document.getElementById("wallCanvas");
const ctx = canvas.getContext("2d");

const roomImage = getRoomImage();

const startSelectionButton =
    document.getElementById("start-selection");

const undoSelectionButton =
    document.getElementById("undo-selection");

const clearSelectionButton =
    document.getElementById("clear-selection");

const finishSelectionButton =
    document.getElementById("finish-selection");

const selectionStatus =
    document.getElementById("selection-status");


const applyPaintButton =
    document.getElementById("apply-paint");

const resetPaintButton =
    document.getElementById("reset-paint");

const paintOpacityInput =
    document.getElementById("paint-opacity");

const opacityValue =
    document.getElementById("opacity-value");

paintOpacityInput.addEventListener("input", function () {
    opacityValue.textContent =
        paintOpacityInput.value + "%";

    if (selectedPoints.length >= 3) {
        paintWall(paintColorInput.value);
    }
});



let isSelecting = false;
let selectedPoints = [];

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

if (roomImage) {

    image.src = roomImage;

} else {

    console.log("No image found in sessionStorage");

}

startSelectionButton.addEventListener("click", function () {

    isSelecting = true;
    selectedPoints = [];

    redrawCanvas();

    selectionStatus.textContent =
        "Selection mode is active. Click points around the wall.";
});

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

    redrawCanvas();

    console.log("Selected point:", x, y);
});

undoSelectionButton.addEventListener("click", function () {

    if (selectedPoints.length === 0) {
        return;
    }

    selectedPoints.pop();

    redrawCanvas();

    selectionStatus.textContent =
        "Last selection point removed.";
});

clearSelectionButton.addEventListener("click", function () {

    selectedPoints = [];
    isSelecting = false;

    redrawCanvas();

    selectionStatus.textContent =
    "Selection cleared and paint removed. Click \"Start Selection\" to begin again.";
});

finishSelectionButton.addEventListener("click", function () {

    if (selectedPoints.length < 3) {

        selectionStatus.textContent =
            "Please select at least 3 points to finish the wall.";

        return;
    }

    isSelecting = false;

    redrawCanvas(true);

    selectionStatus.textContent =
        "Wall selection completed successfully.";
});

function redrawCanvas(closePath = false) {

    if (!image.complete || !image.naturalWidth) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(image, 0, 0);

    drawSelection(closePath);
}

function drawSelection(closePath = false) {

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

    if (closePath) {
        ctx.closePath();
    }

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.stroke();
}
applyPaintButton.addEventListener("click", function () {
    if (selectedPoints.length < 3) {
        selectionStatus.textContent =
            "Please select at least 3 points first.";

        return;
    }

    const paintColor = paintColorInput.value;

    paintWall(paintColor);

    selectionStatus.textContent =
        "Paint colour applied successfully.";
});
function paintWall(color) {

    redrawCanvas();

    ctx.save();

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

    ctx.closePath();

    ctx.clip();

    ctx.globalAlpha =
        Number(paintOpacityInput.value) / 100;

    if (selectedDesign === "solid") {

        ctx.fillStyle = color;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

    if (selectedDesign === "vertical-stripes") {

        ctx.fillStyle = color;

        for (let x = 0; x < canvas.width; x += 40) {

            ctx.fillRect(
                x,
                0,
                20,
                canvas.height
            );
        }

    }

    if (selectedDesign === "horizontal-stripes") {

        ctx.fillStyle = color;

        for (let y = 0; y < canvas.height; y += 40) {

            ctx.fillRect(
                0,
                y,
                canvas.width,
                20
            );
        }

    }

    if (selectedDesign === "grid") {

        ctx.fillStyle = color;

        for (let x = 0; x < canvas.width; x += 40) {

            ctx.fillRect(
                x,
                0,
                20,
                canvas.height
            );
        }

        for (let y = 0; y < canvas.height; y += 40) {

            ctx.fillRect(
                0,
                y,
                canvas.width,
                20
            );
        }

    }

    ctx.restore();

    drawSelection(true);
}