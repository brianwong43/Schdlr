firebase.auth().onAuthStateChanged((user) => {
  if(user) {
    db.collection('users').doc(user.uid).get().then((doc) => {
      if(doc.exists){
        console.log("Document data:", doc.data());
      } else {
        console.log("No such document");
      }
    });
  } else {
    alert("not signed in");
  }
});

function signup() {
    let email = document.getElementById('useremail').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password1').value;
    let confirmPassword = document.getElementById('password2').value;

    console.log(document.getElementById("useremail").value);
    console.log(document.getElementById('username').value);
    console.log(document.getElementById("password1").value);
    console.log(document.getElementById('password2').value);
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
        console.log("Right before createuser");
        createUser(username);
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("YOU'RE A FAILURE");
        // ..
    });
}

function createUser(username){
      console.log("Beginning of createUser");
      var user = firebase.auth().currentUser;
      console.log("Made user: " + user.uid);

      // Set firestore db with user
      
      db.collection("users").doc(user.uid)
      .withConverter(userConverter)
      .set(new User(username, []))
      .then(() => {
        console.log("Document successfully written!");
        updateProfile(username);
        })
        .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

function updateProfile(username){
    console.log("current: "+firebase.auth().currentUser.displayName);
    firebase.auth().currentUser.updateProfile({
        displayName: username
    }).then(function() {
        console.log(firebase.auth().currentUser.displayName);
        console.log('User Profile Updated Successfully');
        window.location.replace("home.html");
    }).catch(function(error) {
    // An error happened.
    });
    
}

/*function printDisplayName(){
  var userUpdate = firebase.auth().currentUser;
  alert(userUpdate.displayName);
}*/

function login() {
    let loginemail = document.getElementById('loginuseremail').value;
    let loginpassword = document.getElementById('loginpassword').value;
    console.log(loginemail);
    console.log(loginpassword);
    // [START auth_signin_password]
    firebase.auth().signInWithEmailAndPassword(loginemail, loginpassword)
      .then((userCredential) => {
        // Signed in
        alert("Success!");
        var user = userCredential.user;
        window.location.replace("home.html");
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Wrong username or password.");
      });
    // [END auth_signin_password]
}

function signOut(){
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    alert("Signed Out");
  }).catch((error) => {
    // An error happened.
    alert("Failed to Sign Out");
  });
}

function printDisplayName(){
  //var user = firebase.auth().currentUser;
  if(user) {
    db.collection('users').doc(user.uid).get().then((doc) => {
      if(doc.exists){
        //console.log("Document data:", doc.data());
        alert("Your name is: " + doc.data().displayName);
      } else {
        console.log("No such document");
      }
    });
  } else {
    alert("not signed in");
  }
}

/*var user = firebase.auth().currentUser;
auth.onAuthStateChanged(user => {
    if(user) {
      db.collection('users').inSnapshot(snapshot => {
        setupUI(user);
      });
    } else {
      setupUI();
    }
});

//function displayProfile(){
const displayTheName = document.querySelector('.display-name');
//const displayFriends = document.querySelector('.friends');

const setupUI = (user) => {
  if(user) {
    const html = '<div>Logged in as ${user.displayName}</div>';
    displayTheName.innerHTML = html;

    //const html2 = '<div>Logged in as ${user.displayName}</div>';
    //displayFriends.innerHTML = html2;
  } else {
    console.log("not logged in");
  }
}*/
//}