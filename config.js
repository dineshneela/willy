import * as firebase from 'firebase';
require('@firebase/firestore')
var firebaseConfig = {
  apiKey: "AIzaSyCjpTeHgC-SKqAd202kqnu4XptR-deLDrA",
  authDomain: "willy-4cddd.firebaseapp.com",
  projectId: "willy-4cddd",
  storageBucket: "willy-4cddd.appspot.com",
  messagingSenderId: "624586238770",
  appId: "1:624586238770:web:52962697f52cf8ecca052b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();