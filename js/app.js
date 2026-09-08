  const beforeImage =
            document.getElementById("before-image");

        const afterImage =
            document.getElementById("after-image");

        const originalRoom =
            getRoomImage();

        const paintedRoom =
            getPaintedImage();

        if (originalRoom) {

            beforeImage.src =
                originalRoom;

        }

        if (paintedRoom) {

            afterImage.src =
                paintedRoom;

        }