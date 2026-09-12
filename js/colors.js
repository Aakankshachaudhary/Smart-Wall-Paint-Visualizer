const PAINT_COLOURS = [
  { name: "Cloud White", hex: "#F3F1EA" },
  { name: "Warm Linen", hex: "#D9C7AA" },
  { name: "Sandstone", hex: "#C6A985" },
  { name: "Sage Leaf", hex: "#8FA88B" },
  { name: "Misty Blue", hex: "#91AFC4" },
  { name: "Terracotta", hex: "#B86F55" },
  { name: "Deep Forest", hex: "#42604B" },
  { name: "Charcoal", hex: "#41454A" },
];
let paintColorInput = document.getElementById("paint-color");
let colorButtons = document.querySelectorAll(".color-option");
function setActiveColor(button) {
  colorButtons.forEach((item) => item.classList.remove("active"));
  if (button) button.classList.add("active");
}
colorButtons.forEach((button) =>
  button.addEventListener("click", () => {
    if (!paintColorInput) return;
    paintColorInput.value = button.dataset.color;
    setActiveColor(button);
    document.dispatchEvent(
      new CustomEvent("paintcolorchange", {
        detail: { color: button.dataset.color },
      }),
    );
  }),
);
paintColorInput?.addEventListener("input", () => {
  setActiveColor(null);
  document.dispatchEvent(
    new CustomEvent("paintcolorchange", {
      detail: { color: paintColorInput.value },
    }),
  );
});
function getPaintColourName(hex) {
  const item = PAINT_COLOURS.find(
    (c) => c.hex.toLowerCase() === String(hex).toLowerCase(),
  );
  return item?.name || "Custom colour";
}
