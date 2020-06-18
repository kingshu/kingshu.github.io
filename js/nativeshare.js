if (!HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {
    var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);
    for (var i=0; i<len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }
    callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
};

document.getElementById("share-btn").addEventListener('click', event => {
    
    var imgCanvas = document.getElementById("canvas-reducedimg");
    var pltCanvas = document.getElementById("canvas-palette");
    var pCtx = pltCanvas.getContext("2d");

    var targetCanvas = document.createElement("canvas");
    targetCanvas.height = imgCanvas.height * 2;
    targetCanvas.width = imgCanvas.width * 2;
    var tCtx = targetCanvas.getContext("2d");
    tCtx.drawImage(imgCanvas, 0, 0, targetCanvas.width, targetCanvas.height);

    var pltDrawWidth  = targetCanvas.width / 2;
    var pltDrawHeight = targetCanvas.height / 2;
    var pltDrawStartX = targetCanvas.width / 4;
    var pltDrawStartY = targetCanvas.height / 4;
    

    if (   (imgCanvas.height > imgCanvas.width && pltCanvas.height > pltCanvas.width)
        || (imgCanvas.height < imgCanvas.width && pltCanvas.height < pltCanvas.width)) {
        tCtx.drawImage(pltCanvas, pltDrawStartX, pltDrawStartY, pltDrawWidth, pltDrawHeight);
    } else {
        var tempCanvas = document.createElement("canvas"),
        tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = pltCanvas.height;
        tempCanvas.height = pltCanvas.width;
        tempCtx.translate(pltCanvas.height/2, pltCanvas.width/2);
        tempCtx.rotate(Math.PI/2);
        tempCtx.drawImage(pltCanvas, -pltCanvas.width/2, -pltCanvas.height/2);

        tCtx.drawImage(tempCanvas, pltDrawStartX, pltDrawStartY, pltDrawWidth, pltDrawHeight);
    }

    //

    targetCanvas.toBlob(function(blob) {

        uploadToS3(blob);

        var imgAsFile = new File([blob], "myflosspalette.png", {type: "image/png", lastModified: Date.now()});
        var shareData = { files: [imgAsFile] };

        try {
            if (navigator.canShare && navigator.canShare(shareData)) {
                shareData.url = "https://67.160.103.208:8000";
                shareData.title = "My DMC floss palette on Flossfinder!";

                navigator.share(shareData)
            } else {
                // fallback
                console.log("womp womp");
            }

        } catch(err) {
            alert(err);
        }
    });

});

function uploadToS3(blob) {
    var formData = new FormData();

    formData.append("key", uuidv4() + ".png");
    formData.append("expires", "60");
    formData.append("acl", "public-read");
    formData.append("Content-Type", "image/png");
    formData.append("file", blob);

    var request = new XMLHttpRequest();
    request.open("POST", "https://flossfinder.s3.amazonaws.com");
    request.send(formData);
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}