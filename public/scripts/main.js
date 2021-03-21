function myFunction() {
    let email = document.getElementById('useremail').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password1').value;
    let confirmPassword = document.getElementById('password2').value;

    console.log(document.getElementById("useremail").value);
    console.log(document.getElementById('username').value);
    console.log(document.getElementById("password1").value);
    console.log(document.getElementById('password2').value);
    console.log("test");
    if(password != confirmPassword){
        console.log("ERROR PASSWORD DOES NOT MATCH");
        alert("Passwords do not match, please try again.");
        return;
        //confirmPassword.setCustomValidity('Passwords Don\'t Match');
    } 
    else if (password.length < 6){
        console.log("ERROR PASSWORD TOO SHORT");
        alert("Too short! Password must be 6 characters or longer.");
        return;
    }
    else {
        alert("Success!")
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