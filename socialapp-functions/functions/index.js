const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();

const config = {
    apiKey: "AIzaSyD4_zNp84P2AMs0Hn5byK7JnP2O4qvPBrg",
    authDomain: "social-app-fe5f4.firebaseapp.com",
    databaseURL: "https://social-app-fe5f4.firebaseio.com",
    projectId: "social-app-fe5f4",
    storageBucket: "social-app-fe5f4.appspot.com",
    messagingSenderId: "780054413737",
    appId: "1:780054413737:web:6c43952b269b84aa9804b8",
    measurementId: "G-XW0D1HWX46"
};

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const firebase = require('firebase');
firebase.initializeApp(config)

const db = admin.firestore();

app.get('/scream', (req, res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = []
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                })
            });
            return res.json(screams)
        })
        .catch((error) => console.error(error))
})


app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
        .collection(('screams'))
        .add(newScream)
        .then((doc) => {
            res.json({message: `document ${doc.id} created successfully`})
        })
        .catch(error => {
            res.status(500).json({error: "Something went wrong!"});
            console.error(error)
        })
});

const isEmpty = (string) => {
    return string.trim() === '';
}

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return email.match(regEx)
}

// Signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    let errors = {}

    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(newUser.email)) {
        errors.email = "Must be a valid email address";
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not empty';
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Password must match';
    if(isEmpty(newUser.handle)) errors.handle = 'Must not empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    let token, userId;
    db.doc(`/users/${newUser}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({handle: 'this handle is already taken'});
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId,
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials)
        })
        .then(() => {
            return res.status(201).json({token});
        })
        .catch(error => {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                return res.status(400).json({email: 'email is already in use'})
            } else {
                return res.status(500).json({error: error.code});
            }
        });
});

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};

    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token})
        })
        .catch(errors => {
            console.error(errors)
            if(errors.code === 'auth/wrong-password') {
                return res.status(403).json({general: 'wrong credentials, please try again'})
            }
            return res.status(500).json({error: errors.code})
        })
})

exports.api = functions.region('europe-west1').https.onRequest(app);