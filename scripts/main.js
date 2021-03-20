var useremail;
var username;
var password1;
var password2;

let submitSignUp = document.querySelector('submitSignUp');
//submitSignUp.addEventListener('click', myFunction, false);
submitSignUp.onclick(myFunction);

function myFunction() {
    //console.log(document.getElementById('useremail').value);
    useremail = document.getElementById('useremail').value;
    username = document.getElementById('username').value;
    password1 = document.getElementById('password1').value;
    password2 = document.getElementById('password2').value;
    
    //if(password1 != password2 console.log("ERROR");
    firebase.auth().createUserWithEmailAndPassword(useremail, password1)
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