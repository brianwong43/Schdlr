class User {
    constructor(displayName, friends) {
        this.displayName = displayName;
        this.friends = friends;
    }
    toString() {
        return this.displayName + ', ' + this.friends;
    }
}

var userConverter = {
    toFirestore: function(user) {
        return {
            displayName: user.displayName,
            friends: user.friends
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new User(data.displayName, data.friends);
    }
};