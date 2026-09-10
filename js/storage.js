// Current room image
function saveRoomImage(imageData) {
    sessionStorage.setItem("roomImage", imageData);
}

function getRoomImage() {
    return sessionStorage.getItem("roomImage");
}

function removeRoomImage() {
    sessionStorage.removeItem("roomImage");
}

// Current painted image
function savePaintedImage(imageData) {
    sessionStorage.setItem("paintedImage", imageData);
}

function getPaintedImage() {
    return sessionStorage.getItem("paintedImage");
}

function removePaintedImage() {
    sessionStorage.removeItem("paintedImage");
}

// Current design metadata
function saveCurrentDesignMetadata(metadata) {
    sessionStorage.setItem("currentDesignMetadata", JSON.stringify(metadata));
}

function getCurrentDesignMetadata() {
    const data = sessionStorage.getItem("currentDesignMetadata");

    if (!data) {
        return null;
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Could not read current design metadata:", error);
        return null;
    }
}

function removeCurrentDesignMetadata() {
    sessionStorage.removeItem("currentDesignMetadata");
}

// IndexedDB for saved designs.
// Images are too large for localStorage, so saved designs use IndexedDB.
function openDesignDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("SmartWallPaintDB", 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("designs")) {
                db.createObjectStore("designs", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

function saveDesign(design) {
    return openDesignDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("designs", "readwrite");
            const store = transaction.objectStore("designs");
            const request = store.add(design);

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}

function getSavedDesigns() {
    return openDesignDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("designs", "readonly");
            const store = transaction.objectStore("designs");
            const request = store.getAll();

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}

function deleteSavedDesign(id) {
    return openDesignDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("designs", "readwrite");
            const store = transaction.objectStore("designs");
            const request = store.delete(id);

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}

function removeSavedDesigns() {
    return openDesignDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("designs", "readwrite");
            const store = transaction.objectStore("designs");
            const request = store.clear();

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}