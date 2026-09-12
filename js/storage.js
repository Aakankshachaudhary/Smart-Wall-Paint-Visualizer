const STORAGE_KEYS = {
  roomImage: "roomImage",
  paintedImage: "paintedImage",
  metadata: "currentDesignMetadata",
  project: "currentProject",
  user: "smartPaintUser",
  auth: "smartPaintAuth",
};

function setSession(key, value) {
  sessionStorage.setItem(key, value);
}
function getSession(key) {
  return sessionStorage.getItem(key);
}
function removeSession(key) {
  sessionStorage.removeItem(key);
}

async function saveRoomImage(data) {
  await saveCurrentRoomImage(data);

  try {
    setSession(STORAGE_KEYS.roomImage, data);
  } catch (error) {
    console.warn(
      "Room image was saved to IndexedDB, but sessionStorage was unavailable.",
      error,
    );
  }
}

function getRoomImage() {
  return getSession(STORAGE_KEYS.roomImage);
}

async function removeRoomImage() {
  try {
    removeSession(STORAGE_KEYS.roomImage);
  } catch {}

  await deleteCurrentRoomImage();
}

function saveCurrentRoomImage(data) {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction("roomImages", "readwrite");
        const request = tx
          .objectStore("roomImages")
          .put({ id: "current", data });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
  );
}

function getCurrentRoomImage() {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db
          .transaction("roomImages", "readonly")
          .objectStore("roomImages")
          .get("current");
        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => reject(request.error);
      }),
  );
}

function deleteCurrentRoomImage() {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db
          .transaction("roomImages", "readwrite")
          .objectStore("roomImages")
          .delete("current");
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
  );
}

function savePaintedImage(data) {
  setSession(STORAGE_KEYS.paintedImage, data);
}
function getPaintedImage() {
  return getSession(STORAGE_KEYS.paintedImage);
}
function removePaintedImage() {
  removeSession(STORAGE_KEYS.paintedImage);
}

function saveCurrentDesignMetadata(data) {
  setSession(STORAGE_KEYS.metadata, JSON.stringify(data));
}
function getCurrentDesignMetadata() {
  try {
    return JSON.parse(getSession(STORAGE_KEYS.metadata) || "null");
  } catch {
    return null;
  }
}
function removeCurrentDesignMetadata() {
  removeSession(STORAGE_KEYS.metadata);
}

function saveCurrentProject(project) {
  setSession(STORAGE_KEYS.project, JSON.stringify(project));
}
function getCurrentProject() {
  try {
    return JSON.parse(getSession(STORAGE_KEYS.project) || "null");
  } catch {
    return null;
  }
}
function removeCurrentProject() {
  removeSession(STORAGE_KEYS.project);
}

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
  } catch {
    return null;
  }
}
function isAuthenticated() {
  return Boolean(getSession(STORAGE_KEYS.auth));
}
function signInLocal(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  setSession(STORAGE_KEYS.auth, "true");
}
function signOutLocal() {
  removeSession(STORAGE_KEYS.auth);
}

function openDesignDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SmartWallPaintDB", 4);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("designs")) {
        db.createObjectStore("designs", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("roomImages")) {
        db.createObjectStore("roomImages", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveDesign(design) {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction("designs", "readwrite");
        const request = tx.objectStore("designs").add(design);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}
function getSavedDesigns() {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db
          .transaction("designs", "readonly")
          .objectStore("designs")
          .getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}
function getSavedDesign(id) {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db
          .transaction("designs", "readonly")
          .objectStore("designs")
          .get(Number(id));
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      }),
  );
}
function deleteSavedDesign(id) {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db
          .transaction("designs", "readwrite")
          .objectStore("designs")
          .delete(Number(id));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
  );
}
function updateSavedDesign(design) {
  return openDesignDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db
          .transaction("designs", "readwrite")
          .objectStore("designs")
          .put(design);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}
