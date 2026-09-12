document.addEventListener("DOMContentLoaded", async () => {
  const toast = document.getElementById("toast");
  const page = document.body.dataset.page;

  const notify = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(
      () => toast.classList.remove("show"),
      2600,
    );
  };
  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[c],
    );
  const label = (d) =>
    ({
      solid: "Solid",
      "vertical-stripes": "Vertical Stripes",
      "horizontal-stripes": "Horizontal Stripes",
      grid: "Grid",
    })[d] || "Solid";
  const download = (data, name) => {
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (page === "preview") {
    const after = getPaintedImage(),
      meta = getCurrentDesignMetadata() || {};
    const beforeImg = document.getElementById("before-image"),
      afterImg = document.getElementById("after-image");
    const cb = document.getElementById("comparison-before-image"),
      ca = document.getElementById("comparison-after-image");
    const before =
      getRoomImage() || (await getCurrentRoomImage().catch(() => null));
    if (!before || !after) {
      document.getElementById("preview-status").textContent =
        "Your preview is no longer available. Return to the editor.";
      return;
    }
    [beforeImg, cb].forEach((i) => {
      if (i) i.src = before;
    });
    [afterImg, ca].forEach((i) => {
      if (i) i.src = after;
    });
    const walls = meta.walls || [],
      summary = document.getElementById("design-summary");
    if (summary)
      summary.innerHTML = `
<div class="summary-item"><span>Walls</span><strong>${walls.filter((w) => w.points?.length >= 3).length}</strong></div>
<div class="summary-item"><span>Colours</span><strong>${new Set(walls.map((w) => w.color)).size}</strong></div>
<div class="summary-item"><span>Patterns</span><strong>${new Set(walls.map((w) => label(w.design))).size}</strong></div>
<div class="summary-item"><span>Updated</span><strong>${meta.updatedAt ? new Date(meta.updatedAt).toLocaleDateString() : "Today"}</strong></div>`;
    const modes = document.querySelectorAll(".preview-mode"),
      cards = document.getElementById("preview-container"),
      comparison = document.getElementById("comparison-tool");
    modes.forEach((btn) =>
      btn.addEventListener("click", () => {
        modes.forEach((x) => x.classList.remove("active"));
        btn.classList.add("active");
        const m = btn.dataset.mode;
        cards.classList.toggle("mode-hidden", m === "comparison");
        comparison.classList.toggle("mode-hidden", m !== "comparison");
        if (m === "before") {
          beforeImg.parentElement.classList.remove("mode-hidden");
          afterImg.parentElement.classList.add("mode-hidden");
        } else if (m === "after") {
          beforeImg.parentElement.classList.add("mode-hidden");
          afterImg.parentElement.classList.remove("mode-hidden");
        } else {
          beforeImg.parentElement.classList.remove("mode-hidden");
          afterImg.parentElement.classList.remove("mode-hidden");
        }
      }),
    );
    const slider = document.getElementById("comparison-slider"),
      layer = document.getElementById("comparison-after-layer"),
      divider = document.getElementById("comparison-divider");
    const update = (v) => {
      if (layer) layer.style.width = `${v}%`;
      if (divider) divider.style.left = `${v}%`;
    };
    slider?.addEventListener("input", (e) => update(e.target.value));
    update(50);
    document
      .getElementById("download-design")
      ?.addEventListener("click", () =>
        download(after, `smart-paint-design-${Date.now()}.jpg`),
      );
    document
      .getElementById("save-design")
      ?.addEventListener("click", async () => {
        const btn = document.getElementById("save-design");
        btn.disabled = true;
        btn.textContent = "Saving…";
        try {
          await saveDesign({
            name: `Room Design ${new Date().toLocaleDateString()}`,
            image: after,
            roomImage: before,
            metadata: meta,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          btn.textContent = "Design Saved";
          notify("Design saved to My Designs");
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = "Save Design";
          }, 1500);
        } catch (e) {
          console.error(e);
          btn.disabled = false;
          btn.textContent = "Save Design";
          notify("Could not save this design.");
        }
      });
  }

  if (page === "saved") {
    const container = document.getElementById("saved-designs-container"),
      search = document.getElementById("saved-design-search"),
      sort = document.getElementById("saved-design-sort"),
      count = document.getElementById("saved-design-count");
    let designs = [];
    const render = () => {
      const q = (search?.value || "").trim().toLowerCase();
      let list = designs.filter((d) => {
        const walls = d.metadata?.walls || [];
        return (
          !q ||
          d.name?.toLowerCase().includes(q) ||
          walls.some((w) =>
            `${w.color} ${label(w.design)}`.toLowerCase().includes(q),
          )
        );
      });
      if (sort?.value === "oldest")
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      else if (sort?.value === "pattern")
        list.sort((a, b) =>
          label(a.metadata?.walls?.[0]?.design).localeCompare(
            label(b.metadata?.walls?.[0]?.design),
          ),
        );
      else
        list.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt),
        );
      if (count)
        count.textContent = `${list.length} of ${designs.length} designs`;
      if (!list.length) {
        container.innerHTML = `<div class="card empty-state"><h2>${designs.length ? "No matching designs" : "Your design library is empty"}</h2><p>${designs.length ? "Try another colour, pattern or name." : "Save a design from the preview screen and it will appear here."}</p><a class="primary-button" href="upload.html">Create a design</a></div>`;
        return;
      }
      container.innerHTML = list
        .map((d) => {
          const w = d.metadata?.walls?.find((x) => x.points?.length >= 3),
            colour = w?.color || "#ddd";
          return `<article class="card saved-card"><img class="saved-card-preview" src="${d.image}" alt="Saved room design"><div class="saved-card-body"><div class="saved-card-title"><div><h3>${escapeHtml(d.name)}</h3><span class="status-pill">${(d.metadata?.walls || []).filter((x) => x.points?.length >= 3).length} wall(s)</span></div><span class="swatch" style="background:${escapeHtml(colour)}"></span></div><div class="saved-meta"><span>${escapeHtml(label(w?.design))}</span><span>${escapeHtml(colour)}</span><span>${new Date(d.updatedAt || d.createdAt).toLocaleDateString()}</span></div><div class="saved-actions"><button class="button primary" data-open="${d.id}">Open</button><button class="button secondary" data-download="${d.id}">Download</button><button class="button secondary danger" data-delete="${d.id}">Delete</button></div></div></article>`;
        })
        .join("");
      container.querySelectorAll("[data-download]").forEach(
        (b) =>
          (b.onclick = () => {
            const d = designs.find((x) => x.id === Number(b.dataset.download));
            download(d?.image, `smart-paint-design-${d.id}.jpg`);
          }),
      );
      container.querySelectorAll("[data-delete]").forEach(
        (b) =>
          (b.onclick = async () => {
            if (!confirm("Delete this saved design?")) return;
            await deleteSavedDesign(b.dataset.delete);
            designs = designs.filter((x) => x.id !== Number(b.dataset.delete));
            render();
            notify("Design deleted");
          }),
      );
      container.querySelectorAll("[data-open]").forEach(
        (b) =>
          (b.onclick = async () => {
            const d = designs.find((x) => x.id === Number(b.dataset.open));
            if (!d) return;
            await saveRoomImage(d.roomImage);
            savePaintedImage(d.image);
            saveCurrentDesignMetadata(d.metadata);
            saveCurrentProject(d.metadata);
            window.location.href = "preview.html";
          }),
      );
    };
    Promise.resolve()
      .then(() => getSavedDesigns())
      .then((data) => {
        designs = data || [];
        render();
      })
      .catch((e) => {
        console.error(e);
        container.innerHTML = `<div class="card error-state"><h2>Design library unavailable</h2><p>Please refresh and try again.</p></div>`;
      });
    search?.addEventListener("input", render);
    sort?.addEventListener("change", render);
  }

  document.querySelectorAll("[data-signout]").forEach((b) =>
    b.addEventListener("click", () => {
      signOutLocal();
      window.location.href = "../index.html";
    }),
  );
});
