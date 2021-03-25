class User {
    constructor(uid, friends) {
        this.uid = uid;
        this.friends = friends;
    }
    toString() {
        return this.uid + ', ' + this.friends;
    }
}

var userConverter = {
    toFirestore: function(user) {
        return {
            uid: user.uid,
            friends: user.friends
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new User(data.uid, data.friends);
    }
};