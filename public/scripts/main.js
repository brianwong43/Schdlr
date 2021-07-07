// Asynchronus locks
var searchUsersSemaphore = 0; 
var searchFriendsSemaphore = 0;

// Global lists for tracking friends in created events
var eventFriendsEmailsList = []; 
var eventFriendsUidList = [];

/*
 *  Calls every time a page is loaded
 */
firebase.auth().onAuthStateChanged((user) => {
    if(user) {

      /* INDEX HTML */
      if(window.location.pathname == "/index.html" || window.location.pathname == "/") {
        // If user is signed in, redirect them to home.html
        window.location.replace("home.html");
      }

      /* HOME.HTML */
      else if(window.location.pathname == "/home.html") {
        passFirebaseUser(user);
        handleClientLoad();
      }
        
      /* PROFILE.HTML */
      else if(window.location.pathname == "/profile.html") {
        // NAME
        document.getElementById("profileName").innerHTML = user.displayName;

        // PHOTO
        document.getElementById("profilePicture").src = user.photoURL;

        // FRIENDS
        db.collection('users').doc(user.uid).get().then((doc) => {
          if(doc.exists){
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
        document.getElementById("profileName").value = user.displayName;
        document.getElementById("displayProfilePic").src = user.photoURL;
      }

      /* OTHERUSERPROFILE.HTML */
      else if(window.location.pathname == "/otherUserProfile.html") {
        var uid = location.search.substring(1);

        var addBtn = document.getElementById("addFriendButton");
        var rmvBtn = document.getElementById("removeFriendButton");
        db.collection('users').doc(user.uid).get().then((doc) => {
          var currUser = doc.data();
          var currUserFriends = currUser.friends;
          for(const friendUid of currUserFriends) {
            if(uid == friendUid) {
              addBtn.style.display = "none";
              rmvBtn.style.display = "block";
              break;
            }
          }
        });

        db.collection('users').doc(uid).get().then((doc) => {
          if(doc.exists){
            var userObject = doc.data();
            document.getElementById("friendsName").innerHTML = userObject.displayName;

            // PHOTO
            document.getElementById("friendsPicture").src = userObject.photoURL;

            var friendList = userObject.friends;
            if(friendList.length > 0) {
              appendNames(friendList, "friendsFriends");
            }

          }
        });

      } else {
        console.log("location unknown");
      } 

    /* USER NOT LOGGED IN */
    } else {
      if(window.location.pathname == "/login.html") {
        let loginemail = document.getElementById('loginuseremail');
        let loginpassword = document.getElementById('loginpassword');
        let rmCheck = document.getElementById('loginrememberme');
    
        if (localStorage.checkbox && localStorage.checkbox !== "") {
          rmCheck.setAttribute("checked", "checked");
          loginemail.value = localStorage.username;
          loginpassword.value = localStorage.password;
        } else {
          rmCheck.removeAttribute("checked");
          loginemail.value = "";
          loginpassword.value = "";
        }
      }
    }
});

/*
 * Used by PROFILE.HTML and OTHERUSERPROFILE.HTML in Auth Change
 *
 * Displays friends of given user in list format using inner html
 */
function appendNames(uidList, appendId) {
  var user = firebase.auth().currentUser;
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

/* 
 *  Activates when user presses the sign up button
 *  Confirms that the passwords validity and then calls createUser()
 */
function signup() {
    let email = document.getElementById('useremail').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password1').value;
    let confirmPassword = document.getElementById('password2').value;
    if(password != confirmPassword){
        alert("Passwords do not match, please try again.");
        return;
    } 
    if (password.length < 6){
        alert("Too short! Password must be 6 characters or longer.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;   
        createUser(username);
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Failed to sign up");
    });
}

/*
 *  Calls to firebase and creates a generic User object
 */ 
function createUser(username){
      var user = firebase.auth().currentUser;
      // Set firestore db with user
      
      db.collection("users").doc(user.uid)
      .withConverter(userConverter)
      .set(new User(user.uid, username, [], "https://firebasestorage.googleapis.com/v0/b/schdlr-b3435.appspot.com/o/userPhotos%2FProfilePic.jpg?alt=media&token=894cb453-e99b-4663-8cf6-303e15d41269", ""))
      .then(() => {
        addDisplayNameAndPhotoURL(username);
        })
        .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

/*
 *  Updates the generic User object to use the specific username and default image
 */
function addDisplayNameAndPhotoURL(username){
    firebase.auth().currentUser.updateProfile({
        displayName: username,
        photoURL: "https://firebasestorage.googleapis.com/v0/b/schdlr-b3435.appspot.com/o/userPhotos%2FProfilePic.jpg?alt=media&token=894cb453-e99b-4663-8cf6-303e15d41269"
    }).then(function() {
        window.location.replace("home.html");
    }).catch(function(error) {
    // An error happened.
    });
}

/* 
 *  When the user uses profileEdit.html, this function is called to update image and/or name
 */
function updateProfile() {
  let user = firebase.auth().currentUser;
  let profileName = document.getElementById('profileName').value;

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
          alert("File Uploaded");
          document.getElementById("displayProfilePic").src = url;
          window.location.replace("profile.html");
        }).catch(function(error) {
          // An error happened.
          console.log("Problem updating Profile name / photo");
        });
        });
      });
  }
}

/*
 *  This updates the User object, not the firebase user
 */
function updateUserObject(uid, profileName, url) {
  db.collection('users').doc(uid).update({
    displayName: profileName,
    photoURL: url
  });
}

/*
 *  When the user logs in, verifies the information is correct
 */
function login() {
    let loginemail = document.getElementById('loginuseremail').value;
    let loginpassword = document.getElementById('loginpassword').value;
    let rmCheck = document.getElementById('loginrememberme');

    // If user checked "remember me" then refer to localStorage for information
    if (rmCheck.checked && loginemail !== "" && loginpassword !== "") {
      localStorage.username = loginemail;
      localStorage.password = loginpassword;
      localStorage.checkbox = rmCheck.value;
    } else {
      localStorage.username = "";
      localStorage.password = "";
      localStorage.checkbox = "";
    }
    firebase.auth().signInWithEmailAndPassword(loginemail, loginpassword)
      .then((userCredential) => {
        // Signed in
        alert("Success!");
        var user = userCredential.user;
        window.location.replace("home.html");
      })
      .catch((error) => {
        alert("Wrong username or password.");
      });
}

/*
 *  Signs user out
 */
function signOut(){
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    alert("Signed Out");
  }).catch((error) => {
    // An error happened.
    alert("Failed to Sign Out");
  });
}

/*
 *  When the user changes their photo in profileEdit.html, update the image
 */
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

/*
 *  When the search bar is pressed, activate searchForFriends() on input change
 */
function textBoxDropdown() {
  searchForFriends();
  document.getElementById("textBoxInput").oninput = searchForFriends;
}

/*
 * Appends every friends name and photo to the search bar in the modal
 */
function searchForFriends() {
  if(searchFriendsSemaphore == 0) {
    searchFriendsSemaphore = 1;
    var input = document.getElementById("textBoxInput").value.toUpperCase();
    var div = document.getElementById("friendList");
    while (div.firstChild) { // Clears dropdown list
      div.removeChild(div.firstChild);
    }
    var user = firebase.auth().currentUser;
    // Search through all users with overlap
    db.collection('users').doc(user.uid).get().then((doc) => {
      if(doc.exists){
        var currUser = doc.data();
        var friendList = currUser.friends;
        if(friendList.length > 0) {

          // Loops through all the users friends
          for(var i=0; i<friendList.length; i=i+1) {
            db.collection('users').doc(friendList[i]).get().then((doc) => {
              var userObject = doc.data();

              // If the friend starts with the same input, then display
              if(userObject.displayName.toUpperCase().startsWith(input) && !eventFriendsUidList.includes(userObject.uid)) {
                var friend = document.createElement("LI");
                friend.setAttribute("class", "list-group-item");
                friend.innerHTML = "<a><img class='listItemPhoto' src='"+userObject.photoURL+"'>"+userObject.displayName+"</a>";
                friend.onclick = function() {
                  if(userObject.calendarID != "") {
                    eventFriendsEmailsList.push(userObject.calendarID);
                    executeBusyList();
                  } else {
                    eventFriendsEmailsList.push("");
                  }
                  eventFriendsUidList.push(userObject.uid);
                  div.removeChild(friend);
                  createEventFriendsList();
                };
                div.appendChild(friend);
              }
            });
          }
        }
      } else { console.log("Trouble reading user information"); }
    });
    searchFriendsSemaphore = 0;
  }
}

/*
 *  This function is purely for displaying the names of potential invitees.
 *  When the X is pressed, the name is removed from all lists
 */
function createEventFriendsList() {
  var friendsInEvents = document.getElementById("friendsInEvents");
  while (friendsInEvents.firstChild) {//clears list
    friendsInEvents.removeChild(friendsInEvents.firstChild);
  }
  // for all friends in global variable
  var isFirst = true;
  for(const friendUid of eventFriendsUidList) {
    if(isFirst) { isFirst = false; continue; }
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
        // Remove from global arrays by finding index
        var i = eventFriendsUidList.indexOf(friendObject.uid);
        if(i > -1) {
          if(eventFriendsEmailsList[i]!=""){ executeBusyList() };
          eventFriendsUidList.splice(i, 1);
          eventFriendsEmailsList.splice(i, 1);
        }

        friendsInEvents.removeChild(friendElement);
        friendsInEvents.removeChild(closeButton);
      };
      friendsInEvents.appendChild(closeButton);
    });
  }
}

/*
 * Appends every users name and photo to the search dropdown in the nav bar 
 */
function searchForEveryone() {
  if(searchUsersSemaphore == 0) {
    searchUsersSemaphore = 1;
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
            var userObject = doc.data();
            var name = userObject.displayName.toUpperCase();
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

/*
 *  Adds the selected user's uid to a list of the current user's friends
 */
function addFriend() {
  var addBtn = document.getElementById("addFriendButton");
  var rmvBtn = document.getElementById("removeFriendButton");
  addBtn.style.display = "none";
  rmvBtn.style.display = "block";
  var user = firebase.auth().currentUser;
  var uid = location.search.substring(1);
  db.collection('users').doc(user.uid).update({
    friends: firebase.firestore.FieldValue.arrayUnion(uid)
  });
}

/*
 *  Removes friend from the list of user's friends
 */
function removeFriend() {
  var addBtn = document.getElementById("addFriendButton");
  var rmvBtn = document.getElementById("removeFriendButton");
  addBtn.style.display = "block";
  rmvBtn.style.display = "none";
  var user = firebase.auth().currentUser;
  var uid = location.search.substring(1);
  db.collection('users').doc(user.uid).update({
    friends: firebase.firestore.FieldValue.arrayRemove(uid)
  });
}

/* 
 *  When 'Create' is pressed in the Create Event Modal
 *  all information on the page is grabbed and made into an event object.
 *  Then that event is inserted into the user's Google calendar
 */
function createSchedulerEvent() {
  var eventName     = document.getElementById("eventName").value;
  var startdateTime = document.getElementById("startdateTime").value;
  var enddateTime   = document.getElementById("enddateTime").value;
  var eventDescription = document.getElementById("eventDescription").value;
  var eventLocation = document.getElementsByClassName("mapboxgl-ctrl-geocoder--input")[0].value;

  var event = {
    'summary': eventName,
    'location': eventLocation,
    'description': eventDescription,
    'start': {
      'dateTime': startdateTime+=":00-07:00", 
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': enddateTime+=":00-07:00",
      'timeZone': 'America/Los_Angeles'
    },
    'attendees': [],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
      ]
    }
  };

  // Inserts attendees into the Google calendar event to b invited
  for(var i=1; i<eventFriendsEmailsList.length; i++){
    if(eventFriendsEmailsList[i]!="") {
      event.attendees.push({email: eventFriendsEmailsList[i]});
    }
  }

  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });
  
  request.execute(function(event) {
    appendPre('Event created: ' + event.htmlLink);
    window.location.reload();
    alert("Event Created");
  });
}

/* 
 * Loads the Overlap Calendar and finds overlapping freetime in the Create Event Modal
 */
function renderOverlapCalendar(response) {
  var overlapCalendar = document.getElementById("overlapCalendar");
  var calendar;
  calendar = new FullCalendar.Calendar(overlapCalendar, {
    contentHeight: 400,
    selectable: true,
    headerToolbar: { 
      start: 'today prev,next',
      center: 'title',
      end: 'timeGridWeek' 
    },
    initialView: 'timeGridWeek',
    select: function(info) {
      var startTime = document.getElementById("startdateTime");
      var endTime = document.getElementById("enddateTime");
      var dateFormatStart = new Date(info.start+"GMT").toISOString();
      var dateFormatEnd = new Date(info.end+"GMT").toISOString();
      startTime.value = dateFormatStart.replace(":00.000Z", "");
      endTime.value = dateFormatEnd.replace(":00.000Z", "");
    }
  });

  var busyList = [];
  var allBusyLists = response.result.calendars;
  
  for(var cid = 0; cid < eventFriendsEmailsList.length; cid++) {
    if(eventFriendsEmailsList[cid] != "") {
      var calendarID = eventFriendsEmailsList[cid];
      for(var i = 0; i < allBusyLists[calendarID].busy.length; i++) {
        busyList.push({
          start: allBusyLists[calendarID].busy[i].start, 
          end: allBusyLists[calendarID].busy[i].end,
          display: 'background',
          color: 'red'
        });
      }
    }
  }
  calendar.addEventSource(busyList);

  setTimeout(function(){calendar.render();},500);
}

/*
 *  Takes in all potential attendees and highlights when they are busy over the 
 *  next month.
 * 
 *  This allows the user to find times where everyone is free and plan accordingly
 */
function executeBusyList() {

  var calendarIDWithNoEmpty = [];
  for(var i = 0; i < eventFriendsEmailsList.length; i++) {
    if(eventFriendsEmailsList[i] != "") {
      calendarIDWithNoEmpty.push({id: eventFriendsEmailsList[i]});
    }
  }

  var timeMin = new Date().toISOString();
  var timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + 1);
  timeMax = timeMax.toISOString();
  return gapi.client.calendar.freebusy.query({
    "resource": {
      "timeMin": timeMin,
      "timeMax": timeMax,
      "timeZone": 'America/Los_Angeles',
      "items": calendarIDWithNoEmpty
    }
  }).then(function(response) {
    // Handle the results here (response.result has the parsed body).
    renderOverlapCalendar(response);
  },
  function(err) { console.error("Execute error", err); 
  });
}
