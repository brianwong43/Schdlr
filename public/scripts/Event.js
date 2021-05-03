class Event {
    constructor(eventid, eventName, guests, duration) {
        this.eventid = eventid;
        this.eventName = eventName;
        this.guests = guests;
        this.duration = duration;
    }
    toString() {
        return this.eventid + ', ' + this.eventName + ', ' + this.guests + ', ' + this.duration;
    }
}

var eventConverter = {
    toFirestore: function(user) {
        return {
            eventid: user.eventid,
            eventName: user.eventName,
            guests: user.guests,
            duration: user.duration
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new Event(data.eventid, data.eventName, data.guests, data.duration);
    }
};