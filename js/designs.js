const DESIGN_OPTIONS = {
  solid: "Solid",
  "vertical-stripes": "Vertical Stripes",
  "horizontal-stripes": "Horizontal Stripes",
  grid: "Grid",
};
let selectedDesign = "solid";
document.querySelectorAll(".design-option").forEach((button) =>
  button.addEventListener("click", () => {
    selectedDesign = button.dataset.design;
    document
      .querySelectorAll(".design-option")
      .forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.dispatchEvent(
      new CustomEvent("designchange", {
        detail: {
          design: selectedDesign,
        },
      }),
    );
  }),
);
function getSelectedDesign() {
  return selectedDesign;
}
function getDesignLabel(design) {
  return DESIGN_OPTIONS[design] || "Solid";
}
