const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/fbauth');

const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream
} = require('./handlers/screams')

const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser
} = require('./handlers/users');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


// Scream routes
app.get('/screams', getAllScreams);
app.get('/scream/:screamId', getScream);
app.post('/scream', FBAuth, postOneScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

// TODO delete screamId
// TODO like scream
// TODO unlike a scream
// TODO comment on scram

// Users routs
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


exports.api = functions.region('europe-west1').https.onRequest(app);