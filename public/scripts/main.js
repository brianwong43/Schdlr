// Asynchronus locks
var searchUsersSemaphore = 0; 
var searchFriendsSemaphore = 0; 
var eventFriendsList = [];

firebase.auth().onAuthStateChanged((user) => {
    if(user) {

      console.log("User logged in...");
      console.log("PATH: " + window.location.pathname);

      /* INDEX HTML */
      if(window.location.pathname == "/index.html" || window.location.pathname == "/") {
        window.location.replace("home.html");
      }

      /* PROFILE.HTML */
      else if(window.location.pathname == "/profile.html") {
        // NAME
        document.getElementById("profileName").innerHTML = user.displayName;

        // PHOTO
        console.log("user photo URL: " + user.photoURL);
        document.getElementById("profilePicture").src = user.photoURL;

        // FRIENDS
        db.collection('users').doc(user.uid).get().then((doc) => {
          if(doc.exists){
            console.log("Document data:", doc.data());
            var userObject = doc.data();
            var friendList = userObject.friends;
            if(friendList.length > 0) {
              appendNames(friendList, "profileFriends");
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
        document.getElementById("displayProfilePic").src = user.photoURL;
      }

      /* OTHERUSERPROFILE.HTML */
      else if(window.location.pathname == "/otherUserProfile.html") {
        var uid = location.search.substring(1);
        console.log("UID: "+uid);

        var addBtn = document.getElementById("addFriendButton");
        var rmvBtn = document.getElementById("removeFriendButton");
        db.collection('users').doc(user.uid).get().then((doc) => {
          var currUser = doc.data();
          var currUserFriends = currUser.friends;
          for(const friendUid of currUserFriends) {
            if(uid == friendUid) {
              addBtn.style.display = "none";
              rmvBtn.style.display = "block";
              console.log("Already friends");
              break;
            }
          }
        });

        db.collection('users').doc(uid).get().then((doc) => {
          if(doc.exists){
            var userObject = doc.data();
            console.log("USER: " + userObject);
            document.getElementById("friendsName").innerHTML = userObject.displayName;

            // PHOTO
            console.log("user photo URL: " + userObject.photoURL);
            document.getElementById("friendsPicture").src = userObject.photoURL;

            var friendList = userObject.friends;
            if(friendList.length > 0) {
              appendNames(friendList, "friendsFriends");
            }

          }
        });

      } else {
        db.collection('users').doc(user.uid).get().then((doc) => {
          if(doc.exists){
            console.log("Document data:", doc.data());
          } else {
            console.log("No such document");
          }
        });
      } 

    /* USER NOT LOGGED IN */
    } else {
      console.log("User logged out");

      if(window.location.pathname == "/login.html") {
        let loginemail = document.getElementById('loginuseremail');
        let loginpassword = document.getElementById('loginpassword');
        let rmCheck = document.getElementById('loginrememberme');

        console.log("cache username:"+localStorage.username);
        console.log("cache password:"+localStorage.password);
    
        if (localStorage.checkbox && localStorage.checkbox !== "") {
          console.log("checkbox been checked");
          rmCheck.setAttribute("checked", "checked");
          loginemail.value = localStorage.username;
          loginpassword.value = localStorage.password;
        } else {
          console.log("checkbox not checked");
          rmCheck.removeAttribute("checked");
          loginemail.value = "";
          loginpassword.value = "";
        }
      }
    }
});

/*
 * Used by PROFILE.HTML and OTHERUSERPROFILE.HTML in Auth Change
 */
function appendNames(uidList, appendId) {
  var user = firebase.auth().currentUser;
  console.log("Name List: "+uidList);
  for(var i=0; i<uidList.length; i=i+1) {
    db.collection('users').doc(uidList[i]).get().then((doc) => {
      var userObject = doc.data();
      var friend = document.createElement("LI");
      friend.setAttribute("class", "list-group-item");
      if(user.uid == userObject.uid) {
        friend.innerHTML = "<a href='profile.html'><img class='listItemPhoto' src='"+user.photoURL+"'>"+user.displayName+"</a>";
      } else {
        friend.innerHTML = "<a href='otherUserProfile.html?"+userObject.uid+"'><img class='listItemPhoto' src='"+userObject.photoURL+"'>"+userObject.displayName+"</a>";
      }

      document.getElementById(appendId).appendChild(friend);
    });
  }
}

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
      .set(new User(user.uid, username, [], "https://firebasestorage.googleapis.com/v0/b/schdlr-b3435.appspot.com/o/userPhotos%2FProfilePic.jpg?alt=media&token=894cb453-e99b-4663-8cf6-303e15d41269", ""))
      .then(() => {
        console.log("Document successfully written!");
        addDisplayNameAndPhotoURL(username);
        })
        .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

function addDisplayNameAndPhotoURL(username){
    console.log("current: "+firebase.auth().currentUser.displayName);
    firebase.auth().currentUser.updateProfile({
        displayName: username,
        photoURL: "https://firebasestorage.googleapis.com/v0/b/schdlr-b3435.appspot.com/o/userPhotos%2FProfilePic.jpg?alt=media&token=894cb453-e99b-4663-8cf6-303e15d41269"
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
  if(file === undefined){
    user.updateProfile({
        displayName: profileName
    }).then(
      // Update firestore as well
      db.collection('users').doc(user.uid).update({
        displayName: profileName,
      })
      ).then(function() {
        console.log('User Profile Updated Successfully');
        alert("File Uploaded");
        window.location.replace("profile.html");
      }).catch(function(error) {
        // An error happened.
        console.log("Problem updating Profile name");
      });
    }
  else {
    storageRef.put(file).then(function(snapshot) {
      snapshot.ref.getDownloadURL().then(function(url){  
      user.updateProfile({
          photoURL: url,
          displayName: profileName
      }).then(
        // Update firestore as well
        updateUserObject(user.uid, profileName, url)
        ).then(function() {
          console.log('User Profile Updated Successfully');
          alert("File Uploaded");
          document.getElementById("displayProfilePic").src = url;
          window.location.replace("profile.html");
        }).catch(function(error) {
          // An error happened.
          console.log("Problem updating Profile name + photo");
        });
        });
      });
  }
}

function updateUserObject(uid, profileName, url) {
  db.collection('users').doc(uid).update({
    displayName: profileName,
    photoURL: url
  });
}

function login() {
    let loginemail = document.getElementById('loginuseremail').value;
    let loginpassword = document.getElementById('loginpassword').value;
    let rmCheck = document.getElementById('loginrememberme');
    console.log(loginemail);
    console.log(loginpassword);

    if (rmCheck.checked && loginemail !== "" && loginpassword !== "") {
      console.log("setting local storage...");
      localStorage.username = loginemail;
      localStorage.password = loginpassword;
      localStorage.checkbox = rmCheck.value;
    } else {
      console.log("local storage not stored");
      localStorage.username = "";
      localStorage.password = "";
      localStorage.checkbox = "";
    }
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
    gapi.auth2.getAuthInstance().signOut();
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

/* 
 * When the user clicks on the button,
 * toggle between hiding and showing the dropdown content 
 */
function searchDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
  document.getElementById("myInput").oninput = searchForEveryone;
}

function clearGlobalList() {
  eventFriendsList = [];
}

function textBoxDropdown() {
  document.getElementById("textBoxInput").oninput = searchForFriends;
}

/*
 * Appends every friends name and photo to the search bar in the modal
 */
function searchForFriends() {
  if(searchFriendsSemaphore == 0) {
    searchFriendsSemaphore = 1;
    console.log("SEARCH FOR FRIENDS");
    var input = document.getElementById("textBoxInput").value.toUpperCase();
    var div = document.getElementById("friendList");
    while (div.firstChild) {//clears dropdown list
      div.removeChild(div.firstChild);
    }
    var user = firebase.auth().currentUser;
    // Search through all users with overlap
    db.collection('users').doc(user.uid).get().then((doc) => {
      if(doc.exists){
        console.log("Document data:", doc.data());
        var currUser = doc.data();
        var friendList = currUser.friends;
        if(friendList.length > 0) {

          for(var i=0; i<friendList.length; i=i+1) {
            db.collection('users').doc(friendList[i]).get().then((doc) => {
              var userObject = doc.data();
              if(userObject.displayName.toUpperCase().startsWith(input) && input!=="" && !eventFriendsList.includes(userObject.uid)) {
                console.log("Listing: "+userObject.displayName);
                var friend = document.createElement("LI");
                friend.setAttribute("class", "list-group-item");
                friend.innerHTML = "<a><img class='listItemPhoto' src='"+userObject.photoURL+"'>"+userObject.displayName+"</a>";
                friend.onclick = function() {
                  console.log("pushing to global variable: "+userObject.uid);
                  eventFriendsList.push(userObject.uid);
                  div.removeChild(friend);
                  createEventFriendsList();
                };
                
                div.appendChild(friend);
              }
            });
          }
        }
      } else { console.log("uh-oh"); }
    });
    searchFriendsSemaphore = 0;
  }
}

function createEventFriendsList() {
  var friendsInEvents = document.getElementById("friendsInEvents");
  while (friendsInEvents.firstChild) {//clears list
    friendsInEvents.removeChild(friendsInEvents.firstChild);
  }
  // for all friends in global variable
  for(const friendUid of eventFriendsList) {
    console.log("Adding friend with uid: "+friendUid);
    db.collection('users').doc(friendUid).get().then((doc) => {
      var friendObject = doc.data();
      var friendElement = document.createElement("STRONG");
      friendElement.innerHTML = friendObject.displayName;
      friendsInEvents.appendChild(friendElement);
      // close button with onclick
      var closeButton = document.createElement("BUTTON");
      closeButton.setAttribute("style", "color: grey; border-radius: 100%; border-style: none; margin-left: 5px; margin-right: 10px;");
      closeButton.innerHTML = "X";

      closeButton.onclick = function() {
        console.log("Remove friend form event");
        // Remove from global array by finding index
        var i = eventFriendsList.indexOf(friendObject.uid);
        if(i > -1) {
          eventFriendsList.splice(i, 1);
        }
        friendsInEvents.removeChild(friendElement);
        friendsInEvents.removeChild(closeButton);
      };
      friendsInEvents.appendChild(closeButton);
    });
  }
}

function test() {
  console.log("Made it here");
}
/*
 * Appends every users name and photo to the search dropdown in the nav bar 
 */
function searchForEveryone() {
  if(searchUsersSemaphore == 0) {
    searchUsersSemaphore = 1;
    console.log("SEARCH FOR EVERYONE");
    var input = document.getElementById("myInput").value.toUpperCase();
    var div = document.getElementById("peopleList");
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
            if(counter<4 && name.startsWith(input) && input!=="" && userObject.uid !== firebase.auth().currentUser.uid) {
              // append as a child
              var people = document.createElement("LI");
              people.setAttribute("class", "list-group-item");
              people.innerHTML = "<a href='otherUserProfile.html?"+userObject.uid+"'><img class='listItemPhoto' src='"+userObject.photoURL+"'>"+userObject.displayName+"</a>";
              document.getElementById("peopleList").appendChild(people);
              counter++;
            }
        });
        searchUsersSemaphore = 0;
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
  }
}

function addFriend() {
  var addBtn = document.getElementById("addFriendButton");
  var rmvBtn = document.getElementById("removeFriendButton");
  addBtn.style.display = "none";
  rmvBtn.style.display = "block";
  var user = firebase.auth().currentUser;
  var uid = location.search.substring(1);
  console.log("Added Friend UID: "+uid);
  db.collection('users').doc(user.uid).update({
    friends: firebase.firestore.FieldValue.arrayUnion(uid)
  });
}

function removeFriend() {
  var addBtn = document.getElementById("addFriendButton");
  var rmvBtn = document.getElementById("removeFriendButton");
  addBtn.style.display = "block";
  rmvBtn.style.display = "none";
  var user = firebase.auth().currentUser;
  var uid = location.search.substring(1);
  console.log("Removed Friend UID: "+uid);
  db.collection('users').doc(user.uid).update({
    friends: firebase.firestore.FieldValue.arrayRemove(uid)
  });
}

function createSchedulerEvent() {
  //console.log("Calendar List.get: "+ gapi.client.calendar.calendarList.get('jtsuch1122@gmail.com'));
  
  var eventName = document.getElementById("eventName").value;
  var startdateTime = document.getElementById("startdateTime").value;
  console.log("startdatetime: "+startdateTime+':00-07:00');
  var enddateTime = document.getElementById("enddateTime").value;
  console.log("enddatetime: "+enddateTime+":00-07:00");
  var eventDescription = document.getElementById("eventDescription").value;
  var event = {
    'summary': eventName,
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': eventDescription,
    'start': {
      'dateTime': startdateTime+=":00-07:00", 
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': enddateTime+=":00-07:00",
      'timeZone': 'America/Los_Angeles'
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
      {'email': 'lpage@example.com'},
      {'email': 'sbrin@example.com'}
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
      ]
    }
  };

  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });
  
  request.execute(function(event) {
    appendPre('Event created: ' + event.htmlLink);
  });
}