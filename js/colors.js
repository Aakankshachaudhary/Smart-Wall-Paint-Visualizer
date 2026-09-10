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
        paintColorInput.value = button.dataset.color;
        setActiveColor(button);
    });
});

if (paintColorInput) {
    paintColorInput.addEventListener("input", function () {
        setActiveColor(null);
    });
}
