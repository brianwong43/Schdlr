function myFunction() {
    var email = document.getElementById('useremail').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password1');
    var confirmPassword = document.getElementById('password2');

    console.log(document.getElementById("useremail").value);
    console.log(document.getElementById("password1").value);

    if(password.value != confirmPassword.value) {
        console.log("ERROR");
        //confirmPassword.setCustomValidity('Passwords Don\'t Match');
    } else {
        //confirmPassword.setCustomValidity('');
    }

    //password.onchange = validatePassword;
    //confirmPassword.onkeyup = validatePassword;

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        // ...
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
    });
}