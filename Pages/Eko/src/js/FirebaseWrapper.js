// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeVoVIvz18UDl4KCrkKTAXt859MNAydQ8",
    authDomain: "eko-ido.firebaseapp.com",
    databaseURL: "https://eko-ido.firebaseio.com",
    projectId: "eko-ido",
    storageBucket: "eko-ido.appspot.com",
    messagingSenderId: "694785424350",
    appId: "1:694785424350:web:84943eea2472b4194f7b4f"
};

class _FirebaseWrapper {

    constructor() {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        this.getInstance = this.getInstance.bind(this);
        this.getDatabase = this.getDatabase.bind(this);
        this.incrementValue = this.incrementValue.bind(this);
    }

    getInstance() {
        return firebase;
    }

    getDatabase() {
        return firebase.database();
    }

    async incrementValue(path, amount = 1) {
        const incrementer = firebase.database().ref(path);
        let promise = incrementer.transaction((n) => { return n + amount });
        return await (promise);
    }

    async pathExists(path) {
        const userViewsRef = firebase.database().ref(path);
        const snap = await userViewsRef.once('value');
        return snap.exists();
    }

    async get(path) {
        const userViewsRef = firebase.database().ref(path);
        return userViewsRef.once('value').then(snap => { return snap; })
    }

    async addListener(path, callback) {
        const userViewsRef = firebase.database().ref(path);
        return await userViewsRef.on('value', callback);
    }

    async setValue(path, val) {
        const pathRef = firebase.database().ref(path);
        return await pathRef.set(val)
    }

}

const Firebase_SingleTone = new _FirebaseWrapper();

export default Firebase_SingleTone;
