function enable() {
    var result = confirm('Are you sure you want to enable this account?');
    if(result == false){
        event.preventDefault();
    }
}

function disable() {
    var result = confirm('Are you sure you want to disable this account?');
    if(result == false){
        event.preventDefault();
    }
}

function deleteAccount(){
    var result = confirm('Are you sure you want to delete this account?');
    if(result == false){
        event.preventDefault();
    }
}

function reject() {
    var result = confirm('Are you sure you want to reject this appointment?');
    if(result == false){
        event.preventDefault();
    }
}

function update() {
    var result = confirm('Are you sure you want to update this account?');
    if(result == false){
        event.preventDefault();
    }
}

function accept() {
    var result = confirm('Are you sure you want to accept this appointment');
    if(result == false){
        event.preventDefault();
    }
}

function logout() {
    var result = confirm('Are you sure you want to logout?');
    if(result == false){
        event.preventDefault();
    }
}