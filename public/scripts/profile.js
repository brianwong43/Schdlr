firebase.auth().onAuthStateChanged((user) => {
    if(user) {
        console.log("User logged in Profile");
        console.log(window.location.pathname);
        // Print Display Name
        document.getElementById("profileName").innerHTML = user.displayName;

        // Get friends list
        db.collection('users').doc(user.uid).get().then((doc) => {
          if(doc.exists){
            console.log("Document data:", doc.data());
            var userObject = doc.data();
            var friendList = userObject.friends;

            // Loop through list to add friend list element
            for(var i=0; i<friendList.length; i++){
              var friend = document.createElement("LI");
              friend.setAttribute("class", "list-group-item");
              friend.innerHTML = friendList[i];
              document.getElementById("profileFriends").appendChild(friend);
            }
          } else {
            console.log("No such document");
          }
        });
    } else {
      console.log("User logged out Profile");
    }
});