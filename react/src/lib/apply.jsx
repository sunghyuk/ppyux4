import {RaidMemberTable} from "../lib/logs.js";
import {AuthContext} from "../lib/fb.js";
import {
    getNextDays, ViewTitle
} from "../lib/common.js";


class ApplyLink extends React.Component {
    render() {
        return (
            <a href={`/v2/apply#${this.props.id}`}>{this.props.name}</a>
        )
    }
}

class ApplyView extends React.Component {
    constructor(props) {
        super(props);
    }

    countByRole(role) {
        return Object.values(this.props.doc.data().a).filter(u => u.role == role).length
    }

    render() {
        const doc = this.props.doc

        const caption = (
            <React.Fragment>
                <div>
                    <span>{Object.keys(doc.data().a).length} / {doc.data().max}</span>
                    <span className={"ml-2"}>
                        <img src={"/images/t.png"} style={{width:'18px'}} className={'mr-1'} /><span className={"mr-2"}>{this.countByRole('t')}</span>
                        <img src={'/images/d.png'} style={{width:'18px'}} className={'mr-1'} /><span className={"mr-2"}>{this.countByRole('d')}</span>
                        <img src={'/images/h.png'} style={{width:'18px'}} className={'mr-1'} /><span className={"mr-2"}>{this.countByRole('h')}</span>
                    </span>
                </div>
                <div>
                    불참: {Object.keys(doc.data().na).sort().join(", ")}
                </div>
                <div>
                    {doc.data().memo}
                </div>
            </React.Fragment>
        )
        const users = Object.keys(doc.data().a).map(name => {
            const p = doc.data().a[name]
            return {name: name, clas: p.clas, dt: p.dt, role: p.role}
        }).sort((a, b) => {
            if (a.dt > b.dt) return 1
            if (a.dt < b.dt) return -1
            else return 0
        }).map((u, idx) => {
            let roleIcon
            if (u.role) {
                roleIcon = (
                    <img src={`/images/${u.role}.png`} className={'mr-1'} style={{width:'18px'}} />
                )
            } else {
                roleIcon = (
                    <img src={`/images/x.png`} className={'mr-1'} style={{width:'18px'}} />
                )
            }
            u.content = (
                <React.Fragment>
                    {roleIcon}
                    {u.name}
                    <span className={"badge badge-dark ml-2"}><small>{idx+1}</small></span>
                </React.Fragment>
            )
            return u
        })

        const titleParam = {
            back: (
                <a href={"#"} className={"btn btn-light btn-sm"}>목록</a>
            ),
            title: (
                <h3>
                    {this.props.doc.data().dn}
                    <small className={"text-muted ml-2"}>{doc.data().dt} {doc.data().dh}</small>
                </h3>
            )
        }

        return (
            <React.Fragment>
                <ViewTitle {...titleParam} />
                <RaidMemberTable caption={caption} users={users} />
            </React.Fragment>
        )
    }
}

class NewScheduleButton extends React.Component {
    render() {
        const css = this.props.visible ? "btn btn-secondary" : "btn btn-primary"
        const text = this.props.visible ? "취소" : "일정 추가"
        return (
            <div className={"row"}>
                <div className={"col text-right"}>
                    <button type="button" className={css} onClick={this.props.onClick}>{text}</button>
                </div>
            </div>
        )
    }
}

class ApplyButton extends React.Component {
    render() {
        return (
            <div className={"row"}>
                <div className={"col text-right"}>
                    <button type="button" className={css} onClick={this.props.onClick}>{text}</button>
                </div>
            </div>
        )
    }
}

class ApplyForm extends React.Component {
    constructor(props) {
        super(props);
        const cache = window.localStorage.getItem("a")
        if (cache) {
            this.state = {
                value: JSON.parse(cache),
                error: null
            }
        } else {
            this.state = {
                value: {},
                error: null
            }
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        const val = {}
        val[event.target.name] = event.target.value
        this.setState({
            value: {...this.state.value, ...val},
            error: null
        })
    }

    handleSubmit(event) {
        const name = event.target.name
        if (this.validateForm(name)) {
            this.props.submit(name, this.state.value)
        }
        event.preventDefault();
    }

    validateForm(name) {
        const val = this.state.value
        let error
        if (name == "apply") {
            if (!val.c) error = "직업을 선택하세요"
        }
        if (!val.n) error = "이름을 입력하세요"
        if (error) {
            this.setState({
                error: error
            })
            return false
        }
        return true
    }

    render() {
        return (
            <div className={"modal-dialog"}>
                <div className={"modal-content"}>
                    <div className="modal-body">
                        <form>
                            <div className="form-row">
                                <div className="col form-group">
                                    <select className="custom-select mr-sm-2" value={this.state.value.c} onChange={this.handleChange} name={"c"}>
                                        <option value="">직업 선택</option>
                                        <option value="전사">전사</option>
                                        <option value="사제">사제</option>
                                        <option value="마법사">마법사</option>
                                        <option value="도적">도적</option>
                                        <option value="주술사">주술사</option>
                                        <option value="사냥꾼">사냥꾼</option>
                                        <option value="흑마법사">흑마법사</option>
                                        <option value="드루이드">드루이드</option>
                                    </select>
                                </div>
                                <div className="col">
                                    <select className="custom-select" value={this.state.value.r} onChange={this.handleChange} name={"r"}>
                                        <option value="">역할</option>
                                        <option value="t">탱커</option>
                                        <option value="d">딜러</option>
                                        <option value="h">힐러</option>
                                    </select>
                                </div>
                                <div className="col">
                                    <input type="text" className="form-control" value={this.state.value.n} placeholder="캐릭명" onChange={this.handleChange} name={"n"}></input>
                                </div>
                            </div>
                            {this.state.error &&
                                <div className={"alert alert-warning"}>{this.state.error}</div>
                            }
                        </form>
                        <div className="modal-footer">
                            <div className='text-muted text-left mt-2'>
                                취소, 불참은 이름만 입력해도 됩니다.
                            </div>
                            <button type="button" className="btn btn-primary" onClick={this.handleSubmit} name={"apply"}>신청</button>
                            <button type="button" className="btn btn-danger" onClick={this.handleSubmit} name={"nonattend"}>불참</button>
                            <button type="button" className="btn btn-danger" onClick={this.handleSubmit} name={"cancel"}>취소</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class NewScheduleForm extends React.Component {
    static contextType = AuthContext

    constructor(props) {
        super(props);
        this.state = {
            value: {
                dh: "22",
                dm: "00",
                memo: "10시 시작, 문의 : 땡구르르, Mika, 즐겨맞기"
            },
            error: null
        }

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        const val = {}
        val[event.target.name] = event.target.value
        this.setState({
            value: {...this.state.value, ...val},
            error: null
        })
    }

    handleSubmit(event) {
        if (this.validateForm()) {
            this.props.submit(this.state.value)
        }
        event.preventDefault();
    }

    validateForm() {
        const val = this.state.value
        let error
        if (!val.dt) error = "날짜를 선택하세요"
        if (!val.dungeon) error = "던전을 선택하세요"
        if (error) {
            this.setState({
                error: error
            })
            return false
        }
        return true
    }

    render() {
        const nextDays = getNextDays(10)

        const user = this.context
        if (user) {
            return (
                <div className={"modal-dialog"}>
                    <div className={"modal-content"}>
                        <div className="modal-body">
                            <form>
                                <div className="form-row">
                                    <div className="col-6">
                                        <select name="dt" className="custom-select mr-sm-2" value={this.state.value.dt} onChange={this.handleChange}>
                                            <option value="">날짜</option>
                                            {nextDays.map(d => {
                                                return (
                                                    <option key={d.d}>{d.d} ({d.w})</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div className="col">
                                        <select name="dh" className="custom-select mr-sm-2" value={this.state.value.dh} onChange={this.handleChange}>
                                            {[...Array(24).keys()].map(h => {
                                                return (
                                                    <option key={h} value={h}>{h} 시</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div className="col">
                                        <select name="dm" className="custom-select mr-sm-2" value={this.state.value.dm} onChange={this.handleChange}>
                                            <option value="00">00 분</option>
                                            <option value="10">10 분</option>
                                            <option value="20">20 분</option>
                                            <option value="30">30 분</option>
                                            <option value="40">40 분</option>
                                            <option value="50">50 분</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col">
                                        <select name="dungeon" className="custom-select mr-sm-2" value={this.state.value.dungeon} onChange={this.handleChange}>
                                            <option value="">던전 선택</option>
                                            <option value="안퀴라즈 사원">안퀴라즈 사원</option>
                                            <option value="검은날개 둥지">검은날개 둥지</option>
                                            <option value="화산 심장부">화산 심장부</option>
                                            <option value="오닉시아의 둥지">오닉시아의 둥지</option>
                                            <option value="줄구룹">줄구룹</option>
                                            <option value="안퀴라즈 폐허">안퀴라즈 폐허</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group mt-2">
                                    <textarea name="memo" className="form-control" rows="8" value={this.state.value.memo} onChange={this.handleChange}></textarea>
                                </div>
                                {this.state.error &&
                                    <div className={"alert alert-warning"}>{this.state.error}</div>
                                }
                                <div className="modal-footer">
                                    {this.props.cancelBtn}
                                    <button type="button" className="btn btn-primary" onClick={this.handleSubmit.bind(this)}>저장</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )
        } else {
            return null
        }
    }
}

export {
    ApplyView, NewScheduleForm, NewScheduleButton, ApplyForm, ApplyLink
}