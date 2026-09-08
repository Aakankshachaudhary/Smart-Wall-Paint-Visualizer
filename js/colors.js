const paintColorInput = document.getElementById("paint-color");
const colorOptions = document.querySelectorAll(".color-option");

colorOptions.forEach(function (option) {

    option.addEventListener("click", function () {

        const selectedColor =
            option.dataset.color;

        paintColorInput.value =
            selectedColor;

        colorOptions.forEach(function (item) {
            item.classList.remove("active");
        });

        option.classList.add("active");
    });

});

paintColorInput.addEventListener("input", function () {

    colorOptions.forEach(function (item) {
        item.classList.remove("active");
    });

});