const paintColorInput = document.getElementById("paint-color");
const colorButtons = document.querySelectorAll(".color-option");

function setActiveColor(button) {
    colorButtons.forEach((item) => item.classList.remove("active"));

    if (button) {
        button.classList.add("active");
    }
}

colorButtons.forEach((button) => {
    button.addEventListener("click", function () {
        if (!paintColorInput) return;

        paintColorInput.value = button.dataset.color;
        setActiveColor(button);

        document.dispatchEvent(
            new CustomEvent("paintcolorchange", {
                detail: { color: button.dataset.color }
            })
        );
    });
});

if (paintColorInput) {
    paintColorInput.addEventListener("input", function () {
        setActiveColor(null);

        document.dispatchEvent(
            new CustomEvent("paintcolorchange", {
                detail: { color: paintColorInput.value }
            })
        );
    });
}
