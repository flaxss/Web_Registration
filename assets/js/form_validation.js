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
    let checkBox = document.getElementById("myCheck");
    let content = document.getElementById("show");
    // disable required
    let inputs = document.getElementsByClassName("toDisableRequired");

    //copying value
    let residential1 = document.querySelector(".residential1");
    let residential2 = document.querySelector(".residential2");
    
    let barangay1 = document.querySelector(".barangay1");
    let barangay2 = document.querySelector(".barangay2");

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
function copyInfo(){
    let checkBox = document.getElementById("myCheck");
    let content = document.getElementById("show");

    let bene_inputs = document.getElementsByClassName("toDisableRequired");

    if (checkBox.checked == true){

        document.querySelector("[name='bene_lastname']").removeAttribute("required")
        document.querySelector("[name='bene_firstname']").removeAttribute("required")
        document.querySelector("[name='bene_middlename']").removeAttribute("required")
        document.querySelector("[name='bene_exname']").removeAttribute("required")
        document.querySelector("[name='bene_birthdate']").removeAttribute("required")
        // document.querySelector("[name='bene_age']").removeAttribute("required")
        document.querySelector("[name='bene_sex']").removeAttribute("required")
        document.querySelector("[name='bene_contact_number']").removeAttribute("required")
        document.querySelector("[name='bene_civil_status']").removeAttribute("required")
        document.querySelector("[name='bene_street']").removeAttribute("required")
        document.querySelector("[name='bene_brgy']").removeAttribute("required")
        document.querySelector("[name='bene_municipal']").removeAttribute("required")
        document.querySelector("[name='bene_province']").removeAttribute("required")

        document.querySelector("[name='bene_lastname']").value = document.querySelector("[name='lastname']").value
        document.querySelector("[name='bene_firstname']").value = document.querySelector("[name='firstname']").value
        document.querySelector("[name='bene_middlename']").value = document.querySelector("[name='middlename']").value
        document.querySelector("[name='bene_exname']").value = document.querySelector("[name='exname']").value
        document.querySelector("[name='bene_birthdate']").value = document.querySelector("[name='birthdate']").value
        // document.querySelector("[name='bene_age']").value = document.querySelector("[name='age']").value
        document.querySelector("[name='bene_sex']").value = document.querySelector("[name='sex']").value
        document.querySelector("[name='bene_contact_number']").value = document.querySelector("[name='contact_number']").value
        document.querySelector("[name='bene_civil_status']").value = document.querySelector("[name='civil_status']").value
        document.querySelector("[name='bene_street']").value = document.querySelector("[name='street']").value
        document.querySelector("[name='bene_brgy']").value = document.querySelector("[name='brgy']").value
        document.querySelector("[name='bene_municipal']").value = document.querySelector("[name='municipal']").value
        document.querySelector("[name='bene_province']").value = document.querySelector("[name='province']").value
        content.style.display = "none";
    } else {
        content.style.display = "block";
        for (var i = 0; i < bene_inputs.length; i++) {
            bene_inputs[i].setAttribute("required", "");
        }
    }
}