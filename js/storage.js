function saveRoomImage(imageData) {
    sessionStorage.setItem("roomImage", imageData);
}

function getRoomImage() {
    return sessionStorage.getItem("roomImage");
}

function removeRoomImage() {
    sessionStorage.removeItem("roomImage");
}
function savePaintedImage(imageData) {
    sessionStorage.setItem("paintedImage", imageData);
}

function getPaintedImage() {
    return sessionStorage.getItem("paintedImage");
}

function removePaintedImage() {
    sessionStorage.removeItem("paintedImage");
}
const designDBRequest =
    indexedDB.open("SmartWallPaintDB", 1);

designDBRequest.onupgradeneeded = function (event) {

    const db = event.target.result;

    if (!db.objectStoreNames.contains("designs")) {

        db.createObjectStore("designs", {
            keyPath: "id",
            autoIncrement: true
        });
    }
};

function saveDesign(design) {

    return new Promise(function (resolve, reject) {

        const request =
            indexedDB.open("SmartWallPaintDB", 1);

        request.onsuccess = function (event) {

            const db = event.target.result;

            const transaction =
                db.transaction(
                    ["designs"],
                    "readwrite"
                );

            const store =
                transaction.objectStore("designs");

            store.add(design);

            transaction.oncomplete = function () {

                db.close();
                resolve();
            };

            transaction.onerror = function () {

                db.close();
                reject(transaction.error);
            };
        };

        request.onerror = function () {

            reject(request.error);
        };
    });
}

function getSavedDesigns() {

    return new Promise(function (resolve, reject) {

        const request =
            indexedDB.open("SmartWallPaintDB", 1);

        request.onsuccess = function (event) {

            const db = event.target.result;

            const transaction =
                db.transaction(
                    ["designs"],
                    "readonly"
                );

            const store =
                transaction.objectStore("designs");

            const getRequest =
                store.getAll();

            getRequest.onsuccess = function () {

                db.close();

                resolve(getRequest.result);
            };

            getRequest.onerror = function () {

                db.close();

                reject(getRequest.error);
            };
        };

        request.onerror = function () {

            reject(request.error);
        };
    });
}

function deleteSavedDesign(id) {

    return new Promise(function (resolve, reject) {

        const request =
            indexedDB.open("SmartWallPaintDB", 1);

        request.onsuccess = function (event) {

            const db = event.target.result;

            const transaction =
                db.transaction(
                    ["designs"],
                    "readwrite"
                );

            const store =
                transaction.objectStore("designs");

            store.delete(id);

            transaction.oncomplete = function () {

                db.close();
                resolve();
            };

            transaction.onerror = function () {

                db.close();
                reject(transaction.error);
            };
        };

        request.onerror = function () {

            reject(request.error);
        };
    });
}

function removeSavedDesigns() {

    return new Promise(function (resolve, reject) {

        const request =
            indexedDB.open("SmartWallPaintDB", 1);

        request.onsuccess = function (event) {

            const db = event.target.result;

            const transaction =
                db.transaction(
                    ["designs"],
                    "readwrite"
                );

            const store =
                transaction.objectStore("designs");

            store.clear();

            transaction.oncomplete = function () {

                db.close();
                resolve();
            };

            transaction.onerror = function () {

                db.close();
                reject(transaction.error);
            };
        };

        request.onerror = function () {

            reject(request.error);
        };
    });
}