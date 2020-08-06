import Client from "./lib/fb.js";
import {ErrorBoundary} from "./lib/common.js";
import {AuthProvider, AuthContext} from "./lib/fb.js";

const EMAIL_RE = /\S+@\S+\.\S+/

function errorMsg(err) {
    let msg
    switch (err.code) {
        case 'auth/email-already-in-use':
            msg = "이미 가입한 이메일입니다."
            break
        case 'auth/weak-password':
            msg = "비밀번호가 너무 짧습니다. (최소 6자 이상)"
            break
        case 'auth/invalid-email':
            msg = "이메일 형식이 잘못되었습니다."
            break
        case 'auth/wrong-password':
            msg = '비밀번호가 틀렸습니다.'
            break
        default:
            msg = `${err.code} - ${err.message}`
    }
    return msg
}

class GoogleSignInButton extends React.Component {

    constructor(props) {
        super(props);
        this.client = new Client()
    }

    handleClick(e) {
        e.preventDefault()
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/user.emails.read');
        this.client.auth.signInWithRedirect(provider);
        return;
    }

    render() {
        return (
            <div className="row">
                <div className="col">
                    <span className="mr-2 h5">구글 아이디로 로그인</span>
                    <a href="#" onClick={this.handleClick.bind(this)}>
                        <img src="/images/btn_google_signin_dark_normal_web.png" />
                    </a>
                </div>
            </div>

        )
    }
}

class SignInForm extends React.Component {

    constructor(props) {
        super(props);

        this.client = new Client()

        this.state = {
            email: '',
            password: '',
            error: null
        }

        this.handleChange = this.handleChange.bind(this)
        this.signInClicked = this.signInClicked.bind(this)
    }

    handleChange(event) {
        const t = event.target
        this.setState({
            [t.name]: t.value,
            error: null
        })
    }

    signInClicked() {
        const form = this.state
        if (!form.email) {
            this.setState({
                error: "이메일을 입력하세요."
            })
            return
        }
        if (!form.password) {
            this.setState({
                error: "비밀번호를 입력하세요."
            })
            return
        }
        this.client.auth.signInWithEmailAndPassword(form.email, form.password).catch(err => {
            this.setState({
                error: errorMsg(err)
            })
        })
    }

    render() {
        return (
            <form>
                <div className="form-group row">
                    <label htmlFor="email" className="col-4 col-form-label">Email</label>
                    <div className="col-8">
                        <input type="text" className="form-control col-sm-6" name="email"
                               value={this.state.email} placeholder="이메일 주소" onChange={this.handleChange}></input>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="password" className="col-4 col-form-label">비밀번호</label>
                    <div className="col-8">
                        <input type="password" className="form-control col-sm-6" name="password" value={this.state.password} onChange={this.handleChange}></input>
                    </div>
                </div>
                {this.state.error &&
                <div className="alert alert-danger">{this.state.error}</div>
                }
                <button type="button" className="btn btn-primary" onClick={this.signInClicked}>로그인</button>
            </form>
        )
    }
}

class SignUpForm extends React.Component {

    constructor(props) {
        super(props);

        this.client = new Client()

        this.state = {
            email: '',
            password: '',
            passwordConfirm: ''
        }

        this.handleChange = this.handleChange.bind(this)
        this.signUpClicked = this.signUpClicked.bind(this)
    }

    handleChange(event) {
        const t = event.target
        this.setState({
            [t.name]: t.value,
            error: null
        })
    }

    signUpClicked() {
        const form = this.state
        if (form.password != form.passwordConfirm) {
            this.setState({
                error: "비밀번호가 일치하지 않습니다."
            })
            return
        }
        if (!EMAIL_RE.test(form.email)) {
            this.setState({
                error: "이메일 형식을 확인해주세요."
            })
            return
        }
        this.client.auth.createUserWithEmailAndPassword(form.email, form.password).then(user => {
            console.log("user signup", user)
        }).catch(err => {
            this.setState({
                error: errorMsg(err)
            })
        })
    }


    render() {
        return (
            <form>
                <div className="form-group row">
                    <label htmlFor="email" className="col-4 col-form-label">Email</label>
                    <div className="col-8">
                        <input type="text" className="form-control col-sm-6" name="email"
                               placeholder="이메일 주소" value={this.state.email} onChange={this.handleChange}></input>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="password" className="col-4 col-form-label">비밀번호</label>
                    <div className="col-8">
                        <input type="password" className="form-control col-sm-6" name="password" value={this.state.password} onChange={this.handleChange}></input>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="passwordConfirm" className="col-4 col-form-label">비밀번호 확인</label>
                    <div className="col-8">
                        <input type="password" className="form-control col-sm-6" name="passwordConfirm" value={this.state.passwordConfirm} onChange={this.handleChange}></input>
                    </div>
                </div>
                {this.state.error &&
                <div className="alert alert-danger">{this.state.error}</div>
                }
                <button type="button" className="btn btn-primary" onClick={this.signUpClicked}>가입</button>
            </form>
        )
    }
}

class LoginPage extends React.Component {

    static contextType = AuthContext

    render() {
        const user = this.context
        if (user && user.auth) {
            window.location.replace('/v2/mypage')
        }

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-1"></div>
                    <div className="col">
                        <ul className="nav nav-tabs mb-3" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab"
                                   aria-controls="home" aria-selected="true">로그인</a>
                            </li>
                            <li className="nav-item" role="presentation">
                                <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab"
                                   aria-controls="profile" aria-selected="false">가입</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <SignInForm/>
                            </div>
                            <div className="tab-pane" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                <SignUpForm/>
                            </div>
                        </div>
                        <hr color="#fff" />
                    </div>
                    <div className="col-1"></div>
                </div>
                <div className="row">
                    <div className="col">
                        <GoogleSignInButton />
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

ReactDOM.render(
    <ErrorBoundary>
        <AuthProvider>
            <LoginPage />
        </AuthProvider>
    </ErrorBoundary>
    , document.getElementById("main-view")
)