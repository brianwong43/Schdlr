function myFunction() {
    var email = document.getElementById('useremail').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password1').value;
    var password2 = document.getElementById('password2').value;
    //console.log(document.getElementById("useremail").value);
    //console.log(document.getElementById("password1").value);
    //if(password1 != password2 console.log("ERROR");
    //var email = "bob@example.com";
    //var password = "hunter2";
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