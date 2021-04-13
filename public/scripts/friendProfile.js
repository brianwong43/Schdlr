function createHTMLProfile() {
    var user = firebase.auth().currentUser;
    document.implementation.createHTMLDocument("userProfiles/"+user.uid);
    const head = `
        <meta charset="utf-8">
        <meta name="author" content="Co-authored: Brian Wong, Justin Tsuchiyama, Tyler Luk">
        <meta name="description" content="Website to schedule stuff.">
        <link href="styles/styles.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
        <title>Scheduler</title>
    `;

    const body = `
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" crossorigin="anonymous"></script>
        <!-- The core Firebase JS SDK is always required and must be listed first -->
        <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js"></script>

        <!-- TODO: Add SDKs for Firebase products that you want to use
            https://firebase.google.com/docs/web/setup#available-libraries -->
        <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-firestore.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-auth.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-storage.js"></script>
        
        <script>
        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        var firebaseConfig = {
            apiKey: "AIzaSyCtk-yPYtcMoxMn_7PasKZe3VtxDx4GckQ",
            authDomain: "schdlr-b3435.firebaseapp.com",
            projectId: "schdlr-b3435",
            storageBucket: "schdlr-b3435.appspot.com",
            messagingSenderId: "787536569268",
            appId: "1:787536569268:web:1f2966c2622f1a347a48e1",
            measurementId: "G-95FKY6HTYT"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        firebase.analytics();
        const auth = firebase.auth();
        </script>
        <script src="scripts/User.js"></script>
        <script src="scripts/main.js"></script>

        <!-- Navbar -->
        <nav class="navbar navbar-inverse">
        <div class="container-fluid">
            <div class="navbar-header">
            <a class="navbar-brand" href="home.html">Scheduler</a>
            </div>
            <ul class="nav navbar-nav">
            <li><a href="calendar.html">Calendar</a></li>
            <li class="active"><a href="#">Profile</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
            <li><a href="index.html" onclick="signOut()"><span class="glyphicon glyphicon-log-out"></span> Sign Out</a></li>
            </ul>

            <!-- Search Bar -->
            <div class="dropdown nav navbar-nav navbar-right">
            <button onclick="searchDropdown()" class="dropbtn">Dropdown</button>
            <div id="myDropdown" class="dropdown-content">
                <input type="text" placeholder="Search.." id="myInput">
                <ul class="list-group" id="peopleList"></ul>
            </div>
            </div>

        </div>
        </nav>

        <!-- Content -->
        <div class="container-lg">
        <div class="row" id="account-row">
            <div class="col-sm-8" id="account-row">
            <!-- Left side -->
            <div class="panel panel-primary" id="account-panels">
            <div class="panel-body"><h1>Friends Account Info</h1></div>
            <div class="panel-footer">
                <div class="center-content">
                <!--Profile Picture-->
                <img class="crop" id="friendsPicture" src="images/ProfilePic.jpg">
                </div>
                <br><br>
                <!--Name-->  
                <h1 style="text-align: center;"><span id="friendsName"></span></h1><br>
                <button type="button" class="btn btn-primary" onclick="addFriend()">Add Friend</a>
            </div>
            </div>
        </div>

        <div class="col-sm-4" id="account-row">
            <!-- Right side -->
            <div class="panel panel-primary" id="account-panels">
            <div class="panel-body"><h1>Friends</h1></div>
            <div class="panel-footer">
                <!--input type="text" id="searchBar" placeholder="Search for Friends..."-->
                <p>Friends:</p>
                <ul class="list-group" id="profileFriends"></ul>
            </div>
            </div>
        </div>
    `;

    document.head.innerHTML = head;
    document.body.innerHTML = body;
}