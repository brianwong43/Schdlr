class User {
    constructor(displayName, friends, photoURL) {
        this.displayName = displayName;
        this.friends = friends;
        this.photoURL = photoURL;
    }
    toString() {
        return this.displayName + ', ' + this.friends + ', ' + this.photoURL;
    }
}

var userConverter = {
    toFirestore: function(user) {
        return {
            displayName: user.displayName,
            friends: user.friends,
            photoURL: user.photoURL
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new User(data.displayName, data.friends, data.photoURL);
    }
};