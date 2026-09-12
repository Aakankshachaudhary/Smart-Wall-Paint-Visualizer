(function () {
  const canvas = document.getElementById("wallCanvas");
  const context = canvas?.getContext("2d");
  const roomImage = new Image();
  const canvasPaintColorInput = document.getElementById("paint-color");
  const paintOpacityInput = document.getElementById("paint-opacity");
  const opacityValue = document.getElementById("opacity-value");
  const selectionStatus = document.getElementById("selection-status");
  const selectionPointCount = document.getElementById("selection-point-count");
  const selectionHint = document.getElementById("selection-hint");
  const wallList = document.getElementById("wall-list");
  const activeWallLabel = document.getElementById("active-wall-label");

  let walls = [];
  let activeWallIndex = 0;
  let selectedPoints = [];
  let isSelecting = false;
  let isSelectionFinished = false;
  let history = [];
  let hasUnappliedChanges = false;

  const defaultWall = () => ({
    points: [],
    color: canvasPaintColorInput?.value || "#8FA88B",
    opacity: Number(paintOpacityInput?.value || 70),
    design: "solid",
    name: `Wall ${walls.length + 1}`,
  });

  function showCanvasStatus(text, type = "") {
    if (selectionStatus) {
      selectionStatus.textContent = text;
      selectionStatus.className = `selection-status ${type}`;
    }
  }
  function updatePointCount() {
    if (selectionPointCount)
      selectionPointCount.textContent = `${selectedPoints.length} point${selectedPoints.length === 1 ? "" : "s"}`;
  }
  function updateHint() {
    if (!selectionHint) return;
    selectionHint.textContent = isSelecting
      ? "Click each wall corner. Enter finishes when you have at least 3 points."
      : "Select a wall or start a new selection.";
  }
  function syncCurrentWall() {
    if (!walls[activeWallIndex]) walls[activeWallIndex] = defaultWall();
    walls[activeWallIndex].points = selectedPoints.map((p) => ({
      x: p.x,
      y: p.y,
    }));
    walls[activeWallIndex].color =
      canvasPaintColorInput?.value || walls[activeWallIndex].color;
    walls[activeWallIndex].opacity = Number(
      paintOpacityInput?.value || walls[activeWallIndex].opacity,
    );
  }
  function saveProjectState() {
    syncCurrentWall();
    saveCurrentProject({
      walls,
      activeWallIndex,
      updatedAt: new Date().toISOString(),
    });
  }
  function setCanvasSize() {
    canvas.width = roomImage.naturalWidth;
    canvas.height = roomImage.naturalHeight;
  }
  function drawOriginal() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(roomImage, 0, 0, canvas.width, canvas.height);
  }
  function pathFor(points) {
    if (points.length < 3) return false;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => context.lineTo(p.x, p.y));
    context.closePath();
    return true;
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function renderPattern(color, design, opacity) {
    const { r, g, b } = hexToRgb(color);
    context.globalAlpha = opacity / 100;
    context.fillStyle = `rgb(${r},${g},${b})`;
    // Paint directly over the selected wall so 100% opacity fully replaces the original wall colour.
    context.globalCompositeOperation = "source-over";
    context.fill();
    if (design !== "solid") {
      context.save();
      context.clip();
      context.globalAlpha = Math.min(0.42, opacity / 180);
      context.strokeStyle = "#fff";
      context.lineWidth = Math.max(2, canvas.width / 450);
      const step = Math.max(28, canvas.width / 24);
      if (design === "vertical-stripes" || design === "grid")
        for (let x = 0; x < canvas.width; x += step) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, canvas.height);
          context.stroke();
        }
      if (design === "horizontal-stripes" || design === "grid")
        for (let y = 0; y < canvas.height; y += step) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(canvas.width, y);
          context.stroke();
        }
      context.restore();
    }
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }
  function renderWalls() {
    drawOriginal();
    walls.forEach((wall, index) => {
      if (wall.points.length < 3) return;
      context.save();
      pathFor(wall.points);
      renderPattern(wall.color, wall.design, wall.opacity);
      context.restore();
      if (index === activeWallIndex && !isSelecting) drawOutline(wall.points);
    });
    if (isSelecting && selectedPoints.length) drawOutline(selectedPoints);
  }
  function drawOutline(points) {
    if (!points.length) return;
    context.save();
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => context.lineTo(p.x, p.y));
    if (points.length >= 3) context.closePath();
    context.strokeStyle = "#2457e6";
    context.lineWidth = Math.max(2, canvas.width / 500);
    context.setLineDash([8, 6]);
    context.stroke();
    context.setLineDash([]);
    points.forEach((p, i) => {
      context.beginPath();
      context.arc(p.x, p.y, Math.max(5, canvas.width / 150), 0, Math.PI * 2);
      context.fillStyle = i === 0 ? "#172033" : "#2457e6";
      context.fill();
      context.strokeStyle = "#fff";
      context.lineWidth = 2;
      context.stroke();
    });
    context.restore();
  }
  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          canvas.width,
          ((e.clientX - rect.left) * canvas.width) / rect.width,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          canvas.height,
          ((e.clientY - rect.top) * canvas.height) / rect.height,
        ),
      ),
    };
  }
  function renderWallList() {
    if (!wallList) return;
    wallList.innerHTML = walls
      .map(
        (wall, i) =>
          `<button type="button" class="wall-item ${i === activeWallIndex ? "active" : ""}" data-wall="${i}"><span>${wall.name}</span><small>${wall.points.length >= 3 ? "Selected" : "Draft"}</small></button>`,
      )
      .join("");
    wallList
      .querySelectorAll("[data-wall]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          selectWall(Number(btn.dataset.wall)),
        ),
      );
  }
  function selectWall(index) {
    if (!walls[index]) return;
    syncCurrentWall();
    activeWallIndex = index;
    selectedPoints = walls[index].points.map((p) => ({ ...p }));
    isSelectionFinished = selectedPoints.length >= 3;
    isSelecting = false;
    if (canvasPaintColorInput) canvasPaintColorInput.value = walls[index].color;
    if (paintOpacityInput) paintOpacityInput.value = walls[index].opacity;
    if (opacityValue) opacityValue.textContent = `${walls[index].opacity}%`;
    document
      .querySelectorAll(".design-option")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.design === walls[index].design),
      );
    selectedDesign = walls[index].design;
    activeWallLabel && (activeWallLabel.textContent = walls[index].name);
    updatePointCount();
    updateHint();
    renderWallList();
    renderWalls();
    saveProjectState();
  }
  function startSelection() {
    if (walls.length && walls[activeWallIndex]?.points?.length >= 3) {
      walls.push(defaultWall());
      activeWallIndex = walls.length - 1;
    } else if (!walls.length) {
      walls.push(defaultWall());
      activeWallIndex = 0;
    }
    selectedPoints = [];
    isSelecting = true;
    isSelectionFinished = false;
    showCanvasStatus("Selection started. Click the wall corners.");
    updatePointCount();
    updateHint();
    renderWalls();
  }
  function undoPoint() {
    if (!isSelecting || !selectedPoints.length) return;
    selectedPoints.pop();
    updatePointCount();
    renderWalls();
  }
  function clearSelection() {
    selectedPoints = [];
    isSelecting = false;
    isSelectionFinished = false;
    if (walls[activeWallIndex]) walls[activeWallIndex].points = [];
    showCanvasStatus("Wall selection cleared.");
    updatePointCount();
    updateHint();
    renderWallList();
    renderWalls();
    saveProjectState();
  }
  function finishSelection() {
    if (selectedPoints.length < 3) {
      showCanvasStatus("Select at least 3 points to define a wall.", "error");
      return;
    }
    syncCurrentWall();
    isSelecting = false;
    isSelectionFinished = true;
    walls[activeWallIndex].points = selectedPoints.map((p) => ({ ...p }));
    showCanvasStatus(
      "Wall selected. Your changes will preview live.",
      "success",
    );
    updateHint();
    renderWallList();
    renderWalls();
    saveProjectState();
  }
  function applyLive(markDirty = true) {
    if (!isSelectionFinished || selectedPoints.length < 3) return false;
    syncCurrentWall();
    renderWalls();
    if (markDirty) hasUnappliedChanges = true;
    return true;
  }
  document
    .getElementById("start-selection")
    ?.addEventListener("click", startSelection);
  document
    .getElementById("undo-selection")
    ?.addEventListener("click", undoPoint);
  document
    .getElementById("clear-selection")
    ?.addEventListener("click", clearSelection);
  document
    .getElementById("finish-selection")
    ?.addEventListener("click", finishSelection);
  document.getElementById("apply-paint")?.addEventListener("click", () => {
    if (!isSelectionFinished || selectedPoints.length < 3) {
      showCanvasStatus(
        "Finish the wall selection before applying paint.",
        "error",
      );
      return;
    }
    applyLive(false);
    saveProjectState();
    hasUnappliedChanges = false;
    showCanvasStatus("Design applied to the wall.", "success");
  });
  document.getElementById("reset-paint")?.addEventListener("click", () => {
    if (!walls[activeWallIndex]) return;
    const wall = walls[activeWallIndex];
    wall.color = "#8FA88B";
    wall.opacity = 70;
    wall.design = "solid";
    selectedDesign = "solid";
    if (canvasPaintColorInput) canvasPaintColorInput.value = wall.color;
    if (paintOpacityInput) paintOpacityInput.value = wall.opacity;
    if (opacityValue) opacityValue.textContent = "70%";
    document
      .querySelectorAll(".design-option")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.design === "solid"),
      );
    hasUnappliedChanges = false;
    updateHint();
    renderWallList();
    renderWalls();
    saveProjectState();
    showCanvasStatus(
      "Current wall paint reset to the default colour and solid finish.",
      "success",
    );
  });
  document.getElementById("preview-design")?.addEventListener("click", () => {
    if (!walls.some((w) => w.points.length >= 3)) {
      showCanvasStatus("Select at least one wall before previewing.", "error");
      return;
    }
    applyLive(false);
    saveProjectState();
    savePaintedImage(canvas.toDataURL("image/jpeg", 0.9));
    saveCurrentDesignMetadata({ walls, updatedAt: new Date().toISOString() });
    window.location.href = "preview.html";
  });
  canvas?.addEventListener("click", (e) => {
    if (!isSelecting) return;
    selectedPoints.push(pointFromEvent(e));
    updatePointCount();
    renderWalls();
  });
  canvasPaintColorInput?.addEventListener("input", () => applyLive(true));
  paintOpacityInput?.addEventListener("input", () => {
    if (opacityValue) opacityValue.textContent = `${paintOpacityInput.value}%`;
    applyLive(true);
  });
  document.addEventListener("paintcolorchange", () => applyLive(true));
  document.addEventListener("designchange", (e) => {
    if (!walls[activeWallIndex]) return;
    walls[activeWallIndex].design = e.detail.design;
    applyLive(true);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSelecting) {
      clearSelection();
    }
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "z" &&
      isSelecting
    ) {
      e.preventDefault();
      undoPoint();
    }
    if (e.key === "Enter" && isSelecting && selectedPoints.length >= 3)
      finishSelection();
  });

  async function loadRoomEditorImage() {
    if (!canvas) return;

    const storedImage = getRoomImage();
    let imageData = storedImage;

    if (!imageData) {
      try {
        imageData = await getCurrentRoomImage();
      } catch (error) {
        console.error("Could not read the room image from storage.", error);
      }
    }

    if (!imageData) {
      showCanvasStatus(
        "No room image found. Return to Upload Room first.",
        "error",
      );
      document.getElementById("editor-empty")?.classList.remove("mode-hidden");
      return;
    }

    roomImage.onload = () => {
      setCanvasSize();
      const project = getCurrentProject();

      if (project?.walls?.length) {
        walls = project.walls;
        activeWallIndex = project.activeWallIndex || 0;
        selectWall(activeWallIndex);
      } else {
        walls = [defaultWall()];
        selectedPoints = [];
        renderWallList();
        renderWalls();
      }
    };

    roomImage.onerror = () => {
      showCanvasStatus("The room image could not be loaded.", "error");
      document.getElementById("editor-empty")?.classList.remove("mode-hidden");
    };

    roomImage.src = imageData;
  }

  loadRoomEditorImage();
})();
