
firebase.auth().onAuthStateChanged((user) => {
    if(user) {

      console.log("User logged in...");
      console.log("PATH: " + window.location.pathname);

      /* INDEX HTML */
      if(window.location.pathname == "/index.html") {
        window.location.replace("home.html");
      }

      /* PROFILE.HTML */
      else if(window.location.pathname == "/profile.html") {
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
            console.log("user photo URL: " + user.photoURL);
            if(user.photoURL) {//not empty string
              console.log("in here");
              var storageRef = firebase.storage().ref("userPhotos/"+user.uid);
              storageRef.getDownloadURL().then(function(url) {
                document.getElementById("profilePicture").src = url;
              }).catch(function(error) {
                console.log("FAIl");
              });
            }
          } else {
            console.log("No such document");
            //document.getElementById("profilePicture").src = "images/ProfilePic.jpg";
          }
        });
      }

      /* EDITPROFILE.HTML */
      else if(window.location.pathname == "/profileEdit.html") {
        console.log("Inside of edit profile");
        document.getElementById("profileName").value = user.displayName;
        if(user.photoURL) {//not empty string
          var storageRef = firebase.storage().ref("userPhotos/"+user.uid);
          storageRef.getDownloadURL().then(function(url) {
            document.getElementById("displayProfilePic").src = url;
          }).catch(function(error) {
            console.log("FAIl");
          });
        }
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
  let user = firebase.auth().currentUser;
  let profileName = document.getElementById('profileName').value;
  console.log("current: "+ user.displayName);

  let storageRef = firebase.storage().ref("userPhotos/" + user.uid);  
  let file = document.getElementById("editProfilePicture").files[0];

  storageRef.put(file).then(function(snapshot) {
    snapshot.ref.getDownloadURL().then(function(url){
    user.updateProfile({
        photoURL: url,
        displayName: profileName
    }).then(function() {
        console.log('User Profile Updated Successfully');
        alert("File Uploaded");
        document.getElementById("displayProfilePic").src = url;
        window.location.replace("profile.html");
    }).catch(function(error) {
      // An error happened.
      console.log("Problem updating Profile");
    });
    });
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

function displayPhoto() {
  const preview = document.querySelector('img');
  const file = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();

  reader.addEventListener("load", function() {
    preview.src = reader.result;
  }, false);

  if(file) {
    reader.readAsDataURL(file);
  }
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function searchDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
  document.getElementById("myInput").oninput = searchForFriends;
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function searchForFriends() {
  console.log("in search for friends");
  var input, div;
  input = document.getElementById("myInput").value.toUpperCase();
  div = document.getElementById("peopleList");
  while (div.firstChild) {//clears dropdown list
    div.removeChild(div.firstChild);
  }
  var counter=0;
  // Search through all users with overlap
  db.collection('users').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          console.log(counter);
          var userObject = doc.data();
          var name = userObject.displayName.toUpperCase();
          console.log("Looking at user: " + name);
          console.log("input:" +input);
          if(counter<4 && name.startsWith(input) && input!=="") {
            console.log("in here:");
            // append as a child
            var people = document.createElement("LI");
            people.setAttribute("class", "list-group-item");
            people.innerHTML = name;
            console.log(people);
            document.getElementById("peopleList").appendChild(people);
            counter++;
          }
      });
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
}