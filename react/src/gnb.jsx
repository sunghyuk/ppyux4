import Client from "./lib/fb.js"
import {AuthProvider, AuthContext} from "./lib/fb.js";

class Navigation extends React.Component {

    static contextType = AuthContext

    constructor(props) {
        super(props);
        this.etc = [
            'notice',
            'items',
            'stats',
            'chars',
            'mypage',
            'asset',
            'admin',
            "login"
        ]
    }

    isActive(pages) {
        return pages.includes(this.props.active) ? "active" : "";
    }

    render() {
        const user = this.context
        const text = (user) ? "로그아웃" : "로그인"

        return (
            <nav className="nav nav-masthead justify-content-center">
                <a className={"nav-link " + this.isActive(['v2', 'index'])} href="/v2/index">Home</a>
                <a className={"nav-link " + this.isActive(['apply'])} href="/v2/apply">신청</a>
                <a className={"nav-link " + this.isActive(['logs'])} href="/v2/logs">기록</a>
                <a className={"nav-link dropdown-toggle " + this.isActive(this.etc)} href="#"
                   id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true"
                   aria-expanded="false">{text}</a>
                <div className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown2">
                    <LoginButton />
                    {user &&
                        <a className="dropdown-item" href="/v2/mypage">캐릭터 설정</a>
                    }
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="/v2/notice">공지</a>
                    <a className="dropdown-item" href="/v2/items">아이템</a>
                    <a className="dropdown-item" href="/v2/chars">명단</a>
                    <a className="dropdown-item" href="/v2/stats">통계</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="/v2/asset">공대 자산</a>
                    {(user && user.admin) &&
                        <a className="dropdown-item" href="/v2/admin">기록 관리</a>
                    }
                </div>
            </nav>
        );
    }
}

class LoginButton extends React.Component {

    static contextType = AuthContext

    constructor(props) {
        super(props);
        this.client = new Client()
    }

    handleClick(e) {
        e.preventDefault()
        const user = this.context
        if (user) {
            this.client.auth.signOut().then(function() {
                window.location.reload()
            })
        } else {
            window.location.replace("/v2/login")
        }
    }

    render() {
        const user = this.context
        const link = (user) ? "/v2/logout" : "/v2/login"
        const text = (user) ? "로그아웃" : "로그인"
        return (
            <a className={"dropdown-item"} href={link} onClick={this.handleClick.bind(this)}>{text}</a>
        )
    }
}

const basename = window.location.pathname.split("/").slice(-1)[0]
ReactDOM.render(
    <AuthProvider>
        <Navigation active={basename} />
    </AuthProvider>
    , document.getElementById("nav-view")
)