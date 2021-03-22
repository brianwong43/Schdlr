function signup() {
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
    } 
    if (password.length < 6){
        console.log("ERROR PASSWORD TOO SHORT");
        alert("Too short! Password must be 6 characters or longer.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        alert("Account made");
        window.location.replace("home.html");
        // ...
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("YOU'RE A FAILURE");
        // ..
    });
}

function login() {
    let email = document.getElementById('loginuseremail').value;
    let password = document.getElementById('loginpassword').value;
    // [START auth_signin_password]
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        alert("Success!");
        window.location.replace("home.html");
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Wrong username or password.");
      });
    // [END auth_signin_password]
  }
//MAKE FUNC
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });