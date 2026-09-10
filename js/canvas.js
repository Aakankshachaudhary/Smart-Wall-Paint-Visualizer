const canvas = document.getElementById("wallCanvas");
const context = canvas ? canvas.getContext("2d") : null;

const roomImage = new Image();

const startSelectionButton = document.getElementById("start-selection");
const undoSelectionButton = document.getElementById("undo-selection");
const clearSelectionButton = document.getElementById("clear-selection");
const finishSelectionButton = document.getElementById("finish-selection");
const applyPaintButton = document.getElementById("apply-paint");
const resetPaintButton = document.getElementById("reset-paint");
const previewButton = document.getElementById("preview-design");
const paintOpacityInput = document.getElementById("paint-opacity");
const opacityValue = document.getElementById("opacity-value");
const selectionStatus = document.getElementById("selection-status");

let selectedPoints = [];
let isSelecting = false;
let isSelectionFinished = false;

function showCanvasStatus(message, type = "") {
    if (!selectionStatus) return;

    selectionStatus.textContent = message;
    selectionStatus.className = "selection-status";

    if (type) {
        selectionStatus.classList.add(type);
    }
}

function setCanvasSize() {
    if (!roomImage.naturalWidth || !roomImage.naturalHeight) return;

    canvas.width = roomImage.naturalWidth;
    canvas.height = roomImage.naturalHeight;
}

function drawOriginalImage() {
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(roomImage, 0, 0, canvas.width, canvas.height);
}

function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function createWallPath() {
    if (selectedPoints.length < 3) return;

    context.beginPath();
    context.moveTo(selectedPoints[0].x, selectedPoints[0].y);

    for (let i = 1; i < selectedPoints.length; i++) {
        context.lineTo(selectedPoints[i].x, selectedPoints[i].y);
    }

    context.closePath();
}

function drawSelectionOutline() {
    if (selectedPoints.length === 0) return;

    context.save();
    context.beginPath();
    context.moveTo(selectedPoints[0].x, selectedPoints[0].y);

    for (let i = 1; i < selectedPoints.length; i++) {
        context.lineTo(selectedPoints[i].x, selectedPoints[i].y);
    }

    context.strokeStyle = "#2563eb";
    context.lineWidth = Math.max(2, canvas.width / 500);
    context.setLineDash([8, 6]);
    context.stroke();
    context.restore();
}

function redrawCanvas(showSelection = true) {
    drawOriginalImage();

    if (showSelection && selectedPoints.length > 0) {
        drawSelectionOutline();
    }
}

function drawVerticalStripes() {
    const stripeWidth = Math.max(18, canvas.width / 18);

    for (let x = 0; x < canvas.width; x += stripeWidth * 2) {
        context.fillRect(x, 0, stripeWidth, canvas.height);
    }
}

function drawHorizontalStripes() {
    const stripeHeight = Math.max(18, canvas.height / 18);

    for (let y = 0; y < canvas.height; y += stripeHeight * 2) {
        context.fillRect(0, y, canvas.width, stripeHeight);
    }
}

function drawGrid() {
    const gridSize = Math.max(30, canvas.width / 12);
    const lineWidth = Math.max(3, gridSize / 10);

    for (let x = 0; x <= canvas.width; x += gridSize) {
        context.fillRect(x, 0, lineWidth, canvas.height);
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        context.fillRect(0, y, canvas.width, lineWidth);
    }
}

function drawDesign(design) {
    if (design === "vertical-stripes") {
        drawVerticalStripes();
    } else if (design === "horizontal-stripes") {
        drawHorizontalStripes();
    } else if (design === "grid") {
        drawGrid();
    } else {
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function paintWall(color, showSelection = true) {
    if (selectedPoints.length < 3) {
        showCanvasStatus("Please select the wall first.", "error");
        return null;
    }

    const opacity = Number(paintOpacityInput.value) / 100;
    const design = getSelectedDesign();

    drawOriginalImage();

    context.save();
    createWallPath();
    context.clip();

    context.globalAlpha = opacity;
    context.fillStyle = color;
    drawDesign(design);

    context.restore();

    if (showSelection) {
        drawSelectionOutline();
    }

    return canvas.toDataURL("image/png");
}

function getCurrentMetadata() {
    return {
        color: paintColorInput.value,
        design: getSelectedDesign(),
        opacity: Number(paintOpacityInput.value),
        date: new Date().toLocaleString()
    };
}

canvas.addEventListener("click", function (event) {
    if (!isSelecting) return;

    selectedPoints.push(getCanvasPoint(event));
    redrawCanvas(true);

    showCanvasStatus(
        `${selectedPoints.length} point${selectedPoints.length === 1 ? "" : "s"} selected.`
    );
});

startSelectionButton.addEventListener("click", function () {
    selectedPoints = [];
    isSelecting = true;
    isSelectionFinished = false;

    removePaintedImage();
    removeCurrentDesignMetadata();
    redrawCanvas(true);

    showCanvasStatus("Click around the wall to create your selection.");
});

undoSelectionButton.addEventListener("click", function () {
    if (selectedPoints.length === 0) return;

    selectedPoints.pop();
    isSelectionFinished = false;
    redrawCanvas(true);

    showCanvasStatus(`${selectedPoints.length} point(s) selected.`);
});

clearSelectionButton.addEventListener("click", function () {
    selectedPoints = [];
    isSelecting = false;
    isSelectionFinished = false;

    removePaintedImage();
    removeCurrentDesignMetadata();
    redrawCanvas(false);

    showCanvasStatus("Wall selection cleared.");
});

finishSelectionButton.addEventListener("click", function () {
    if (selectedPoints.length < 3) {
        showCanvasStatus("Select at least 3 points before finishing.", "error");
        return;
    }

    isSelecting = false;
    isSelectionFinished = true;
    redrawCanvas(true);

    showCanvasStatus("Wall selected successfully.", "success");
});

paintOpacityInput.addEventListener("input", function () {
    opacityValue.textContent = `${paintOpacityInput.value}%`;

    if (isSelectionFinished) {
        paintWall(paintColorInput.value, true);
    } else {
        redrawCanvas(true);
    }
});

applyPaintButton.addEventListener("click", function () {
    if (!isSelectionFinished) {
        showCanvasStatus("Finish the wall selection before applying paint.", "error");
        return;
    }

    const paintedImage = paintWall(paintColorInput.value, false);

    if (!paintedImage) return;

    savePaintedImage(paintedImage);
    saveCurrentDesignMetadata(getCurrentMetadata());

    redrawCanvas(true);
    showCanvasStatus("Paint applied successfully.", "success");
});

resetPaintButton.addEventListener("click", function () {
    removePaintedImage();
    removeCurrentDesignMetadata();
    redrawCanvas(true);

    showCanvasStatus("Paint reset. Your wall selection is still available.");
});

previewButton.addEventListener("click", function () {
    if (!getPaintedImage()) {
        showCanvasStatus("Apply a paint design before opening the preview.", "error");
        return;
    }

    window.location.href = "preview.html";
});

roomImage.onload = function () {
    setCanvasSize();
    drawOriginalImage();
    showCanvasStatus("Image loaded. Start selecting the wall.");
};

roomImage.onerror = function () {
    showCanvasStatus("The room image could not be loaded.", "error");
};

const storedRoomImage = getRoomImage();

if (storedRoomImage) {
    roomImage.src = storedRoomImage;
} else {
    showCanvasStatus("No room image found. Please upload a room image first.", "error");

    setTimeout(function () {
        window.location.href = "upload.html";
    }, 1200);
}