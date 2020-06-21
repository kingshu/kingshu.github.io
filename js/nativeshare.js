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

var share = {};
var createSharableCanvas = function() {
    var imgCanvas = document.getElementById("canvas-reducedimg");
    var pltCanvas = document.getElementById("canvas-palette");
    var pCtx = pltCanvas.getContext("2d");

    var bottomBarHeight = 90;

    var targetCanvas = document.createElement("canvas");
    targetCanvas.height = share.height = imgCanvas.height * 2 + bottomBarHeight;
    targetCanvas.width = share.width = imgCanvas.width * 2;
    var tCtx = targetCanvas.getContext("2d");
    tCtx.drawImage(imgCanvas, 0, 0, imgCanvas.width * 2, imgCanvas.height * 2);

    var pltDrawWidth  = imgCanvas.width;
    var pltDrawHeight = imgCanvas.height;
    var pltDrawStartX = imgCanvas.width / 2;
    var pltDrawStartY = imgCanvas.height / 2;


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

    // palette border
    tCtx.strokeStyle = "#8a8a8a";
    tCtx.lineWidth = 8;
    tCtx.strokeRect(pltDrawStartX, pltDrawStartY, pltDrawWidth, pltDrawHeight);

    //bottom bar
    tCtx.fillStyle = "#3F4727";
    tCtx.fillRect(0, targetCanvas.height - bottomBarHeight, targetCanvas.width, bottomBarHeight);

    // bottom bar hashtag
    var shareHashtagText = "#FlossFinder";
    tCtx.font = "35pt Montserrat";
    var htStartX = targetCanvas.width - 320;
    var htStartY = targetCanvas.height - 30;
    tCtx.fillStyle = "#EA9A8A";
    tCtx.fillText(shareHashtagText, htStartX, htStartY);

    prepareDownloads(targetCanvas);

    targetCanvas.toBlob(function(blob) {
        prepareNativeShare(blob);
    });

    return targetCanvas;
}

share.createSharableCanvas = createSharableCanvas;

function prepareDownloads(shareableCanvas) {
    document.getElementById("dl-combo").href = shareableCanvas.toDataURL();
    document.getElementById("dl-img").href = document.getElementById("canvas-reducedimg").toDataURL();
    document.getElementById("dl-plt").href = document.getElementById("canvas-palette").toDataURL();
}

function prepareNativeShare(blob) {
    var imgAsFile = new File([blob], "myflosspalette.png", {type: "image/png", lastModified: Date.now()});
    var shareData = { files: [imgAsFile] };
    if (navigator.canShare && navigator.canShare(shareData)) {
        var shareBtn = document.createElement("button");
        shareBtn.className = "act-btn btn btn-lg btn-default";
        shareBtn.innerHTML = "<span class='glyphicon glyphicon-share-alt'></span> Share";
        shareBtn.addEventListener('click', function(event) {    
            shareData.url = "https://67.160.103.208:8000";
            shareData.title = "Flossfinder";
            shareData.text = "My DMC floss palette on Flossfinder!";
            navigator.share(shareData);
        });
        document.getElementById("actions-cont").append(shareBtn);
    }
}

function uploadToS3(blob, filename, callback) {
    var formData = new FormData();
    formData.append("key", filename);
    formData.append("expires", "60");
    formData.append("acl", "public-read");
    formData.append("Content-Type", "image/png");
    formData.append("file", blob);

    var request = new XMLHttpRequest();
    request.open("POST", "https://flossfinder.s3.amazonaws.com");
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
          callback();
        }
    };
    request.send(formData);
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}