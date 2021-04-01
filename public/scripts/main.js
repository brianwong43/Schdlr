
firebase.auth().onAuthStateChanged((user) => {
    if(user) {

      console.log("User logged in...");
      console.log("PATH: " + window.location.pathname);

      /* PROFILE.HTML */
      if(window.location.pathname == "/profile.html") {
        // NAME
        document.getElementById("profileName").innerHTML = user.displayName;

        // FRIENDS
        db.collection('users').doc(user.uid).get().then((doc) => {
          if(doc.exists){
            console.log("Document data:", doc.data());
            var userObject = doc.data();
            var friendList = userObject.friends;

            for(var i=0; i<friendList.length; i++){
              var friend = document.createElement("LI");
              friend.setAttribute("class", "list-group-item");
              friend.innerHTML = friendList[i];
              document.getElementById("profileFriends").appendChild(friend);
            }

            // PHOTO
            if(user.photoUrl === "") {
              document.getElementById("profilePicture").src = user.photoUrl;
            }
          } else {
            console.log("No such document");
          }
        });
      }

      /* EDITPROFILE.HTML */
      else if(window.location.pathname == "/profileEdit.html") {
        console.log("Inside of edit profile");
        document.getElementById("profileName").value = user.displayName;
      }

      else {
        db.collection('users').doc(user.uid).get().then((doc) => {
          if(doc.exists){
            console.log("Document data:", doc.data());
          } else {
            console.log("No such document");
          }
        });
      } 
    } else {
      console.log("User logged out");
    }
});

function signup() {
    let email = document.getElementById('useremail').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password1').value;
    let confirmPassword = document.getElementById('password2').value;
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
      .set(new User(username, [], ""))
      .then(() => {
        console.log("Document successfully written!");
        addDisplayName(username);
        })
        .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

function addDisplayName(username){
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

function updateProfile() {
  let profilePicture = document.getElementById('editProfilePicture').value;
  console.log("Profile Value: " + profilePicture);

  let profileName = document.getElementById('profileName').value;
  console.log("current: "+firebase.auth().currentUser.displayName);
  firebase.auth().currentUser.updateProfile({
      photoUrl: profilePicture,
      displayName: profileName
  }).then(function() {
      console.log(firebase.auth().currentUser.displayName);
      console.log('User Profile Updated Successfully');
      window.location.replace("profile.html");
  }).catch(function(error) {
  // An error happened.
    console.log("Problem updating Profile");
  });
}

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
