document.addEventListener("DOMContentLoaded", function () {
    const beforeImage = document.getElementById("before-image");
    const afterImage = document.getElementById("after-image");
    const previewStatus = document.getElementById("preview-status");

    const saveDesignButton = document.getElementById("save-design");
    const savedDesignsContainer = document.getElementById("saved-designs-container");

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

        beforeImage.onerror = function () {
            showPreviewStatus("The original room image could not be displayed.", "error");
        };

        afterImage.onerror = function () {
            showPreviewStatus("The painted design could not be displayed.", "error");
        };
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
            saveDesignButton.textContent = "Saving...";

            try {
                await saveDesign({
                    image: image,
                    color: metadata?.color || "#ffffff",
                    design: metadata?.design || "solid",
                    opacity: metadata?.opacity ?? 100,
                    date: metadata?.date || new Date().toLocaleString()
                });

                saveDesignButton.textContent = "Design Saved";
                showPreviewStatus("Design saved successfully.", "success");
            } catch (error) {
                console.error("Could not save design:", error);
                saveDesignButton.disabled = false;
                saveDesignButton.textContent = "Save Design";
                showPreviewStatus(
                    "The design could not be saved. Please try again.",
                    "error"
                );
            }
        });
    }

    if (savedDesignsContainer) {
        loadSavedDesigns();
    }

    async function loadSavedDesigns() {
        savedDesignsContainer.innerHTML =
            '<p class="loading-state">Loading saved designs...</p>';

        try {
            const designs = await getSavedDesigns();

            if (!designs.length) {
                savedDesignsContainer.innerHTML =
                    '<p class="empty-state">No saved designs yet. Create and save a wall design to see it here.</p>';
                return;
            }

            savedDesignsContainer.innerHTML = "";

            designs.sort((a, b) => (b.id || 0) - (a.id || 0));

            designs.forEach(function (design) {
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
                        <p><strong>Colour:</strong> ${escapeHtml(design.color || "Custom")}</p>
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
                        card.remove();

                        if (!savedDesignsContainer.children.length) {
                            savedDesignsContainer.innerHTML =
                                '<p class="empty-state">No saved designs yet. Create and save a wall design to see it here.</p>';
                        }
                    } catch (error) {
                        console.error("Could not delete design:", error);
                        deleteButton.disabled = false;
                        window.alert("The design could not be deleted. Please try again.");
                    }
                });

                savedDesignsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Could not load saved designs:", error);

            savedDesignsContainer.innerHTML =
                '<p class="error-state">Saved designs could not be loaded. Please refresh the page.</p>';
        }
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

        