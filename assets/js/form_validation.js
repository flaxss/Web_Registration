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
    // disable required
    var inputs = document.getElementsByClassName("toDisableRequired");

    //copying value
    var residential1 = document.querySelector(".residential1");
    var residential2 = document.querySelector(".residential2");
    
    var barangay1 = document.querySelector(".barangay1");
    var barangay2 = document.querySelector(".barangay2");

    if (checkBox.checked == true){
        for (var i = 0; i < inputs.length; i++) {
            if (checkBox.checked) {
            inputs[i].removeAttribute("required");
            } else {
            inputs[i].setAttribute("required", "");
            }
        }
        residential2.value = residential1.value;
        barangay2.value = barangay1.value;
        content.style.display = "none";

    } else {
        content.style.display = "block";
    }
}