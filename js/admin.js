document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("admin-design-count");
  if (!el) return;
  try {
    el.textContent = (await getSavedDesigns()).length;
  } catch {
    el.textContent = "0";
  }
});
