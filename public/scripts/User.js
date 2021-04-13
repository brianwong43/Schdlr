class User {
    constructor(uid, displayName, friends, photoURL) {
        this.uid = uid;
        this.displayName = displayName;
        this.friends = friends;
        this.photoURL = photoURL;
    }
    toString() {
        return this.uid + ', ' + this.displayName + ', ' + this.friends + ', ' + this.photoURL;
    }
}

var userConverter = {
    toFirestore: function(user) {
        return {
            uid: user.uid,
            displayName: user.displayName,
            friends: user.friends,
            photoURL: user.photoURL
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new User(data.uid, data.displayName, data.friends, data.photoURL);
    }
};