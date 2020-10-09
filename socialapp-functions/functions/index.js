const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions



app.get('/scream', (req, res) => {
    admin
        .firestore()
        .collection('screams')
        .get()
        .then(data => {
            let screams = []
            data.forEach(doc => {
                screams.push(doc.data())
            } );
            return res.json(screams)
        })
        .catch((error) => console.error(error))
})


app.post('/scream',(req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
        .firestore()
        .collection(('screams'))
        .add(newScream)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully` })
        })
        .catch(error => {
            res.status(500).json({error: "Something went wrong!"});
            console.error(error)
        })
});


exports.api = functions.https.onRequest(app);