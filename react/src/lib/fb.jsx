
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
};
// Initialize Firebase
window.firebase.initializeApp(firebaseConfig);
window.firebase.analytics();


/**
 *
 * firestore collections
 * - users    : user info ; read all, write auth user
 * - schedule : raid schedule, application data ; read, update all,create admin
 * - default  : read all, write admin
 *
 * cloud storage
 * - raid logs data
 * - path: v2/{region}/{realm}/{faction}/{team}/
 * - file: raid.json, version. json
 * - auth: read all, write admin
 *
 */
class Client {

    static VER_KEY = "v"
    static LOGS_KEY = "r"

    static VER_DOC_ID = "version"

    constructor() {
        this.storage = window.firebase.storage()
        this.firestore = window.firebase.firestore()
        this.auth = window.firebase.auth()
    }

    collectionDefault() {
        return this.firestore.collection('default')
    }

    collectionSchedule() {
        return this.firestore.collection('schedule')
    }

    collecitonUsers() {
        return this.firestore.collection('users')
    }

    updateUser(auth, callback) {
        const ref = this.collecitonUsers().doc(auth.uid)
        ref.set({
            email: auth.email,
            uid: auth.uid,
            roles: ['USER'],
            updated: window.moment().format()
        }, {merge:true}).then(() => {
            if (callback) {
                callback()
            }
        })
    }

    updateVersion(version) {
        const ref = this.collectionDefault().doc(Client.VER_DOC_ID)
        return ref.set(version, {merge: true})
    }

    getRaidLogVersion(handler) {
        const ref = this.collectionDefault().doc(Client.VER_DOC_ID)
        ref.get().then(doc => handler(doc.data()))
    }

    downloadRaidLogs(handler) {
        this.getRaidLogVersion(remoteVer => {
            const localVer = window.localStorage.getItem(Client.VER_KEY)
            let logs;
            if (localVer && localVer == remoteVer.version) {
                const cacheLog = window.localStorage.getItem(Client.LOGS_KEY)
                if (cacheLog) {
                    logs = JSON.parse(cacheLog)
                }
            }
            if (logs) {
                handler(logs)
            } else {
                const ref = this.storage.ref("/" + remoteVer.path)
                ref.getDownloadURL().then(url => {
                    fetch(url)
                        .then(res => res.json())
                        .then(result => {
                                window.localStorage.setItem(Client.VER_KEY, remoteVer.version)
                                window.localStorage.setItem(Client.LOGS_KEY, JSON.stringify(result))
                                if (handler) {
                                    handler(result)
                                }
                            }, error => handler(_, error)
                        )
                })
            }
        })
    }
}

const AuthContext = React.createContext({user: null})
class AuthProvider extends React.Component {
    constructor() {
        super();
        this.client = new Client()
        this.state = {
            user: null
        }
    }

    componentDidMount() {
        this.client.auth.onAuthStateChanged(userAuth => {
            console.log("auth state changed", userAuth)
            const auth = userAuth
            let info, admin = false
            if (auth) {
                if (!window.sessionStorage.getItem("u")) {
                    // update user info
                    this.client.updateUser(userAuth, () => {
                        window.sessionStorage.setItem("u", 1)
                    })
                }
                this.client.auth.currentUser.getIdTokenResult().then((token) => {
                    if ("admin" in token.claims) {
                        admin = token.claims.admin
                    }
                    this.setState({
                        user: {
                            auth: auth,
                            admin: admin
                        }
                    });
                })
            } else {
                this.setState({
                    user: null
                });
            }
        });
    }

    render() {
        return (
            <AuthContext.Provider value={this.state.user}>
                {this.props.children}
            </AuthContext.Provider>
        )
    }
}

export default Client;
export {
    AuthProvider, AuthContext
}
