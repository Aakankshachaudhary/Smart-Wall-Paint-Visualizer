document.addEventListener("DOMContentLoaded", function () {
    const beforeImage = document.getElementById("before-image");
    const afterImage = document.getElementById("after-image");
    const previewStatus = document.getElementById("preview-status");
    const previewContainer = document.getElementById("preview-container");
    const beforeCard = document.getElementById("before-card");
    const afterCard = document.getElementById("after-card");
    const designSummary = document.getElementById("design-summary");
    const previewModeButtons = document.querySelectorAll(".preview-mode");
    const comparisonBeforeImage = document.getElementById("comparison-before-image");
    const comparisonAfterImage = document.getElementById("comparison-after-image");
    const comparisonAfterLayer = document.getElementById("comparison-after-layer");
    const comparisonDivider = document.getElementById("comparison-divider");
    const comparisonSlider = document.getElementById("comparison-slider");
    const comparisonValue = document.getElementById("comparison-value");

    const saveDesignButton = document.getElementById("save-design");
    const savedDesignsContainer = document.getElementById("saved-designs-container");
    const savedDesignSearch = document.getElementById("saved-design-search");
    const savedDesignSort = document.getElementById("saved-design-sort");
    const savedDesignCount = document.getElementById("saved-design-count");
    let savedDesigns = [];

    function showPreviewStatus(message, type = "") {
        if (!previewStatus) return;

        previewStatus.textContent = message;
        previewStatus.className = "preview-status";

        if (type) {
            previewStatus.classList.add(type);
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDesignName(design) {
        const names = {
            solid: "Solid",
            "vertical-stripes": "Vertical Stripes",
            "horizontal-stripes": "Horizontal Stripes",
            grid: "Grid"
        };

        return names[design] || "Solid";
    }

    function downloadImage(imageData, filename) {
        if (!imageData) return;

        const link = document.createElement("a");
        link.href = imageData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    if (beforeImage && afterImage) {
        const roomImage = getRoomImage();
        const paintedImage = getPaintedImage();

        if (!roomImage || !paintedImage) {
            showPreviewStatus(
                "Preview data is missing. Please upload an image and apply a design first.",
                "error"
            );
            return;
        }

        beforeImage.src = roomImage;
        afterImage.src = paintedImage;

        if (comparisonBeforeImage && comparisonAfterImage) {
            comparisonBeforeImage.src = roomImage;
            comparisonAfterImage.src = paintedImage;
        }

        beforeImage.onerror = function () {
            showPreviewStatus("The original room image could not be displayed.", "error");
        };

        afterImage.onerror = function () {
            showPreviewStatus("The painted design could not be displayed.", "error");
        };
    }

    function updateComparison(value) {
        const amount = Number(value);
        if (!comparisonAfterLayer || !comparisonDivider) return;

        comparisonAfterLayer.style.clipPath = `inset(0 ${100 - amount}% 0 0)`;
        comparisonDivider.style.left = `${amount}%`;

        if (comparisonValue) {
            comparisonValue.textContent = `${amount}% After`;
        }
    }

    if (comparisonSlider) {
        comparisonSlider.addEventListener("input", function () {
            updateComparison(comparisonSlider.value);
        });

        updateComparison(comparisonSlider.value);
    }

    function updatePreviewMode(mode) {
        if (!previewContainer || !beforeCard || !afterCard) return;

        previewContainer.classList.remove("show-before-only", "show-after-only");

        if (mode === "before") {
            previewContainer.classList.add("show-before-only");
        } else if (mode === "after") {
            previewContainer.classList.add("show-after-only");
        }

        previewModeButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.mode === mode);
        });
    }

    previewModeButtons.forEach((button) => {
        button.addEventListener("click", function () {
            updatePreviewMode(button.dataset.mode);
        });
    });

    const currentMetadata = getCurrentDesignMetadata();

    if (designSummary && currentMetadata) {
        const color = escapeHtml(currentMetadata.color || "Custom");
        const design = escapeHtml(formatDesignName(currentMetadata.design));
        const opacity = escapeHtml(currentMetadata.opacity ?? 100);
        const date = escapeHtml(currentMetadata.date || "Not available");

        designSummary.innerHTML = `
            <h2>Design Details</h2>
            <div class="design-summary-grid">
                <p><strong>Colour</strong><span>${color}</span></p>
                <p><strong>Pattern</strong><span>${design}</span></p>
                <p><strong>Opacity</strong><span>${opacity}%</span></p>
                <p><strong>Created</strong><span>${date}</span></p>
            </div>
        `;
    }

    if (saveDesignButton) {
        saveDesignButton.addEventListener("click", async function () {
            const image = getPaintedImage();
            const metadata = getCurrentDesignMetadata();

            if (!image) {
                showPreviewStatus("Apply a design before saving it.", "error");
                return;
            }

            saveDesignButton.disabled = true;
            saveDesignButton.querySelector(".action-text").textContent = "Saving...";

            try {
                await saveDesign({
                    image: image,
                    color: metadata?.color || "#ffffff",
                    design: metadata?.design || "solid",
                    opacity: metadata?.opacity ?? 100,
                    date: metadata?.date || new Date().toLocaleString(),
                    createdAt: metadata?.createdAt || new Date().toISOString()
                });

                saveDesignButton.querySelector(".action-text").textContent = "Design Saved";
                showPreviewStatus("Design saved successfully.", "success");
            } catch (error) {
                console.error("Could not save design:", error);
                saveDesignButton.disabled = false;
                saveDesignButton.querySelector(".action-text").textContent = "Save Design";
                showPreviewStatus(
                    "The design could not be saved. Please try again.",
                    "error"
                );
            }
        });
    }

    if (savedDesignsContainer) {
        loadSavedDesigns();

        savedDesignSearch?.addEventListener("input", renderSavedDesigns);
        savedDesignSort?.addEventListener("change", renderSavedDesigns);
    }

    async function loadSavedDesigns() {
        savedDesignsContainer.innerHTML =
            '<p class="loading-state">Loading saved designs...</p>';

        try {
            savedDesigns = await getSavedDesigns();
            renderSavedDesigns();
        } catch (error) {
            console.error("Could not load saved designs:", error);

            savedDesignsContainer.innerHTML =
                '<p class="error-state">Saved designs could not be loaded. Please refresh the page.</p>';
        }
    }

    function getDesignTime(design) {
        const time = Date.parse(design.createdAt || "");
        return Number.isFinite(time) ? time : Number(design.id || 0);
    }

    function renderSavedDesigns() {
        if (!savedDesignsContainer) return;

        if (!savedDesigns.length) {
            savedDesignsContainer.innerHTML =
                '<p class="empty-state">No saved designs yet. Create and save a wall design to see it here.</p>';
            if (savedDesignCount) savedDesignCount.textContent = "";
            return;
        }

        const searchTerm = (savedDesignSearch?.value || "").trim().toLowerCase();
        const sortType = savedDesignSort?.value || "newest";
        const filteredDesigns = savedDesigns.filter(function (design) {
            const pattern = formatDesignName(design.design).toLowerCase();
            const colour = String(design.color || "").toLowerCase();
            return !searchTerm || pattern.includes(searchTerm) || colour.includes(searchTerm);
        });

        filteredDesigns.sort(function (a, b) {
            if (sortType === "oldest") {
                return getDesignTime(a) - getDesignTime(b);
            }
            if (sortType === "pattern") {
                return formatDesignName(a.design).localeCompare(formatDesignName(b.design));
            }
            return getDesignTime(b) - getDesignTime(a);
        });

        if (savedDesignCount) {
            savedDesignCount.textContent = `${filteredDesigns.length} of ${savedDesigns.length} design${savedDesigns.length === 1 ? "" : "s"}`;
        }

        if (!filteredDesigns.length) {
            savedDesignsContainer.innerHTML =
                '<p class="empty-state">No designs match your search.</p>';
            return;
        }

        savedDesignsContainer.innerHTML = "";

        filteredDesigns.forEach(function (design) {
                const card = document.createElement("article");
                card.className = "saved-design-card";

                card.innerHTML = `
                    <img
                        class="saved-design-preview"
                        src="${design.image}"
                        alt="Saved wall design preview"
                    >
                    <div class="saved-design-info">
                        <h3>${escapeHtml(formatDesignName(design.design))}</h3>
                        <p class="saved-design-colour">
                            <strong>Colour:</strong>
                            <span class="colour-value">
                                <span
                                    class="colour-swatch"
                                    style="background-color: ${escapeHtml(design.color || "#ffffff")};"
                                    aria-hidden="true"
                                ></span>
                                ${escapeHtml(design.color || "Custom")}
                            </span>
                        </p>
                        <p><strong>Opacity:</strong> ${escapeHtml(design.opacity ?? 100)}%</p>
                        <p><strong>Saved:</strong> ${escapeHtml(design.date || "Unknown")}</p>
                    </div>
                    <div class="saved-design-actions">
                        <button class="download-design" type="button">Download</button>
                        <button class="delete-design" type="button">Delete</button>
                    </div>
                `;

                const downloadButton = card.querySelector(".download-design");
                const deleteButton = card.querySelector(".delete-design");

                downloadButton.addEventListener("click", function () {
                    downloadImage(
                        design.image,
                        `smart-wall-design-${design.id || "saved"}.png`
                    );
                });

                deleteButton.addEventListener("click", async function () {
                    const confirmed = window.confirm(
                        "Are you sure you want to delete this saved design?"
                    );

                    if (!confirmed) return;

                    deleteButton.disabled = true;

                    try {
                        await deleteSavedDesign(design.id);
                        savedDesigns = savedDesigns.filter(item => item.id !== design.id);
                        renderSavedDesigns();
                    } catch (error) {
                        console.error("Could not delete design:", error);
                        deleteButton.disabled = false;
                        window.alert("The design could not be deleted. Please try again.");
                    }
                });

                savedDesignsContainer.appendChild(card);
            });
    }

    const downloadCurrentButton = document.getElementById("download-design");

    if (downloadCurrentButton) {
        downloadCurrentButton.addEventListener("click", function () {
            const image = getPaintedImage();

            if (!image) {
                showPreviewStatus("No painted design is available to download.", "error");
                return;
            }

            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-");

            downloadImage(
                image,
                `smart-wall-painted-design-${timestamp}.png`
            );

            showPreviewStatus("Design download started.", "success");
        });
    }
});


        