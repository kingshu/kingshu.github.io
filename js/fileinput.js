var input = document.getElementById('input'),
    button = document.getElementById('upload-btn'),
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
            sampler.renderPreviewImage(event.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}, false);


document.getElementById("retry-btn").addEventListener('click', function(event) {
    event.preventDefault();
    animations.scrolltop();
    window.location.reload(false);
});