firebase.auth().onAuthStateChanged((user) => {
    if(user) {
        console.log("User logged in Profile");
        printDisplayName();
    } else {
      console.log("User logged out Profile");
    }
});