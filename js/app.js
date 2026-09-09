  const beforeImage =
            document.getElementById("before-image");

        const afterImage =
            document.getElementById("after-image");

        const originalRoom =
            getRoomImage();

        const paintedRoom =
            getPaintedImage();

        if (originalRoom) {

            beforeImage.src =
                originalRoom;

        }

        if (paintedRoom) {

            afterImage.src =
                paintedRoom;

        }

const saveDesignButton =
    document.getElementById("save-design");

if (saveDesignButton) {

    saveDesignButton.addEventListener(
        "click",
        function () {

            const paintedImage =
                getPaintedImage();

            if (!paintedImage) {

                return;
            }

            const design = {

                image: paintedImage,

                date: new Date().toLocaleString()

            };

           saveDesign(design)
              .then(function () {

                saveDesignButton.textContent =
                 "Design Saved";

                 })
             .catch(function (error) {

                  console.error(
                    "Unable to save design:", error
                   );
            });

           setTimeout(function () {

              saveDesignButton.textContent =
               "Save Design";

             }, 1500);

        }
    );
}  
const savedDesignsContainer =
    document.getElementById(
        "saved-designs-container"
    );

if (savedDesignsContainer) {

   const savedDesignsContainer =
    document.getElementById(
        "saved-designs-container"
    );

if (savedDesignsContainer) {

    getSavedDesigns()
        .then(function (savedDesigns) {

            if (savedDesigns.length === 0) {

                savedDesignsContainer.innerHTML =
                    "<p>No saved designs yet.</p>";

                return;
            }

            savedDesigns.forEach(function (design) {

                const designCard =
                    document.createElement("div");

                designCard.classList.add(
                    "saved-design-card"
                );

                designCard.innerHTML = `
                    <img
                        src="${design.image}"
                        alt="Saved wall design"
                    >
                    <p>
                        Saved: ${design.date}
                    </p>
                `;

                savedDesignsContainer.appendChild(
                    designCard
                );
            });
        })
        .catch(function (error) {

            console.error(
                "Unable to load saved designs:",
                error
            );
        });
}
}      

        