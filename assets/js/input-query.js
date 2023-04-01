$('.textOnly').bind('keydown', function(event){
    var key = event.which;
    if ((key >= 48 && key <= 57) || (key >= 95 && key <= 122) || (key >= 144 && key <= 222)) {
        event.preventDefault();
    }
});
function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

const numberInput = document.getElementById('age');
  numberInput.addEventListener('input', () => {
    numberInput.value = numberInput.value.replace(/[^0-9]/g, '');
});