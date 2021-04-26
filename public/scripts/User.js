class User {
    constructor(uid, displayName, friends, photoURL, calendarID) {
        this.uid = uid;
        this.displayName = displayName;
        this.friends = friends;
        this.photoURL = photoURL;
        this.calendarID = calendarID;
    }
    toString() {
        return this.uid + ', ' + this.displayName + ', ' + this.friends + ', ' + this.photoURL + ', ' + this.calendarID;
    }
}

var userConverter = {
    toFirestore: function(user) {
        return {
            uid: user.uid,
            displayName: user.displayName,
            friends: user.friends,
            photoURL: user.photoURL,
            calendarID: user.calendarID
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new User(data.uid, data.displayName, data.friends, data.photoURL, data.calendarID);
    }
};