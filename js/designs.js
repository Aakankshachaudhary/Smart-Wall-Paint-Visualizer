const designOptions =
    document.querySelectorAll(".design-option");

let selectedDesign = "solid";

designOptions.forEach(function (option) {

    option.addEventListener("click", function () {

        selectedDesign =
            option.getAttribute("data-design");

        designOptions.forEach(function (item) {
            item.classList.remove("active");
        });

        option.classList.add("active");

        console.log(
            "Selected design:",
            selectedDesign
        );
    });

});