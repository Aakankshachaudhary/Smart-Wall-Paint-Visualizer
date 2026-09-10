let selectedDesign = "solid";

const designButtons = document.querySelectorAll(".design-option");

designButtons.forEach((button) => {
    button.addEventListener("click", function () {
        selectedDesign = button.dataset.design;

        designButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");
    });
});

function getSelectedDesign() {
    return selectedDesign;
}