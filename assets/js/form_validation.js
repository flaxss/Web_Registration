(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
            alert("Please fill out all the required information.");
        }
        else{
            alert("Are you sure you want to submit this form?");
            document.getElementById("loading").style.display = "block";
            document.getElementById('nav').style.filter = 'blur(3px)';
            document.getElementById('form').style.filter = 'blur(3px)';
            document.getElementById('footer').style.filter = 'blur(3px)';
        }
        form.classList.add('was-validated')
        }, false)
    })
})()
function myFunction() {
    var checkBox = document.getElementById("myCheck");
    var content = document.getElementById("show");
    if (checkBox.checked == true){
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
    // if (document.getElementById('myCheck').checked){
    //     document.getElementById('bene_lastname').value = document.getElementById('lastname').value;
    // }else{
    //     document.getElementById('mailingAddress1').value = ''
    // }
}