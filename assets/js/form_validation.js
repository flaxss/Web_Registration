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
        }
        form.classList.add('was-validated')
        }, false)
    })
})()