function loadTextResource(url, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = () => {
        if (request.status !== 200) {
            callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
        } else {
            callback(null, request.responseText);
        }
    };
    request.send();
}

function loadImage(url, callback) {
    const image = new Image();
    image.onload = () => {
        callback(null, image);
    }
    image.src = url;
}

function loadJsonResource(url, callback) {
    loadTextResource(url, (err, result) => {
        if (err) {
            callback(err);
        } else {
            try {
                callback(null, JSON.parse(result));
            } catch (e) {
                callback(e);
            }
        }
    });
}