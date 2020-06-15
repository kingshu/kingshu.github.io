var input = document.getElementById('input'),
    button = document.getElementById('upload-btn'),
    previewRow = document.getElementById('preview-row'),
    initRow = document.getElementById('init-row');

//route click event on styled button to the actual file input
button.addEventListener("click", function(e) {
    e.preventDefault();
    input.click();
}, false);

//display the name of the selected file
input.addEventListener("change", function(e) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(event) {
            renderPreviewImage(event.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}, false);


var renderPreviewImage = function(src) {
    var outputImg = document.getElementById('preview');
    outputImg.width = "300";
    var img = new Image();
    img.onload = function() {
        if (img.naturalWidth > 300 && window.innerWidth < 786) {
            outputImg.src = resizeImageToSpecificWidth(img, 300);
        } else if (img.naturalWidth > 600) {
            outputImg.src = resizeImageToSpecificWidth(img, 600);
            outputImg.width = "600";
        } else {
            outputImg.width = "" + img.naturalWidth;
            outputImg.src = event.target.result;
        }

        outputImg.onload = function() {
            initRow.style.display = "none";
            previewRow.style.display = "block";
            document.getElementById("retry-row").style.display = "block";
            URL.revokeObjectURL(outputImg.src) // free memory
        };
    };
    img.src = src;
};


function resizeImageToSpecificWidth(img, width) {
    var oc = document.createElement('canvas'), octx = oc.getContext('2d');
    oc.width = img.width;
    oc.height = img.height;
    octx.drawImage(img, 0, 0);
    while (oc.width * 0.5 > width) {
        oc.width *= 0.5;
        oc.height *= 0.5;
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
    }
    oc.width = width;
    oc.height = oc.width * img.height / img.width;
    octx.drawImage(img, 0, 0, oc.width, oc.height);
    return oc.toDataURL();
}

document.getElementById("retry-btn").addEventListener('click', function(event) {
    event.preventDefault();
    window.location.reload(false);
});