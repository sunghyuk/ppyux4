import {cooperToGold} from "../lib/wow.js";

class AdminLogForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: {
                log_url: '',
                seed: '',
                ledger: '',
                realm: '힐스브레드',
                region: 'KR',
                faction: '호드',
                team: '쀼x4',
                name: '',
                dist_per_user: ''
            },
            error: null
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        // anti-pattern?
        if (this.props.value != null) {
            this.setState({
                value: this.props.value
            })
        }
    }

    handleChange(event) {
        const val = {}
        const t = event.target
        val[t.name] = t.value
        this.setState({
            value: {...this.state.value, ...val},
            error: null,
        })
    }

    validateForm() {
        const val = this.state.value
        let error
        if (!val.log_url) error = "Log url을 입력하세요"
        if (!val.ledger)  error = "장부를 입력하세요"
        if (error) {
            this.setState({
                error: error
            })
            return false
        }
        return true
    }

    handleSubmit(event) {
        if (this.validateForm()) {
            this.props.onSubmit(this.state)
        }
    }

    render() {
        const auth = this.props.auth

        return (
            <React.Fragment>
                {(auth && auth.admin) &&
                <div className="row">
                    <div className="col"></div>
                    <div className="col-10">
                        <div className={"modal-dialog"} style={{maxWidth: "100%"}}>
                            <div className={"modal-content"}>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-group text-left">
                                            <label className="text-dark" htmlFor="log_url">Log url</label>
                                            <input type="text" className="form-control" name="log_url"
                                                   value={this.state.value.log_url}
                                                   onChange={this.handleChange}></input>
                                        </div>
                                        <div className="form-group text-left">
                                            <label className="text-dark" htmlFor="seed">시드</label>
                                            <input type="text" className="form-control" name="seed"
                                                   value={this.state.value.seed}
                                                   onChange={this.handleChange}></input>
                                        </div>
                                        <div className="form-group text-left">
                                            <label className="text-dark" htmlFor="ledger">장부 애드온 Text</label>
                                            <textarea className="form-control" value={this.state.value.ledger}
                                                      onChange={this.handleChange} name="ledger" rows="20"></textarea>
                                        </div>
                                        {this.state.error &&
                                        <div className={"alert alert-warning"}>{this.state.error}</div>
                                        }
                                    </form>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-primary"
                                                onClick={this.handleSubmit}>계속
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col"></div>
                </div>
                }
            </React.Fragment>
        )
    }
}

class AdminLogLootTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            lootForm: {
                name: '',
                charname: '',
                income: '',
                outgoing: ''
            },
            error: null
        }

        this.handleLootClick = this.handleLootClick.bind(this)

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        const val = {}
        const t = event.target
        val[t.name] = t.value
        this.setState({
            lootForm: {...this.state.lootForm, ...val},
            error: null
        })
    }

    handleSubmit() {
        this.props.onLootAdd(this.state)
    }

    handleLootClick(event) {
        this.props.onLootChange(event)
    }

    render() {

        const val = this.props.value

        const totalIncome = val.loot.filter(l => !isNaN(l.income)).reduce((a, c) => a += Number(c.income), 0)
        const totalOutgoing = val.loot.filter(l => !isNaN(l.outgoing)).reduce((a, c) => a += Number(c.outgoing), 0)

        return (
            <React.Fragment>
                <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                    <caption>
                        {val.start &&
                        <small>
                            시작: {val.start},
                            종료: {val.end}
                        </small>
                        }
                        {val.log_url &&
                        <small className={"ml-2"}>
                            <a href={val.log_url}>로그 링크</a>
                        </small>
                        }
                    </caption>
                    <thead>
                    <tr>
                        <th>아이템</th>
                        <th>이름</th>
                        <th>수입</th>
                        <th>지출</th>
                        <th>변경</th>
                    </tr>
                    </thead>
                    <tbody>
                    {val.loot.map(l => {
                        return (
                            <tr key={l.key}>
                                <td className="text-left">{l.name}</td>
                                <td className="text-left">{l.charname}</td>
                                <td className="text-right">{cooperToGold(l.income)}</td>
                                <td className="text-right">{cooperToGold(l.outgoing)}</td>
                                <td>
                                    <button className={"btn btn-info btn-sm mr-2"} value={l.key} name={"income"} onClick={this.handleLootClick}>수입</button>
                                    <button className={"btn btn-warning btn-sm mr-2"} value={l.key} name={"outgoing"} onClick={this.handleLootClick}>지출</button>
                                    <button className={"btn btn-danger btn-sm"} value={l.key} name={"remove"} onClick={this.handleLootClick}>삭제</button>
                                </td>
                            </tr>
                        )
                    })}
                    <tr>
                        <td>합계</td>
                        <td></td>
                        <td className={"text-right"}>{cooperToGold(totalIncome)}</td>
                        <td className={"text-right"}>{cooperToGold(totalOutgoing)}</td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
                <div className="row">
                    <div className="col"></div>
                    <div className="col-10">
                        <div className={"modal-dialog"} style={{maxWidth: "100%"}}>
                            <div className={"modal-content"}>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-row">
                                            <div className="col form-group">
                                                <input type="text" className="form-control" value={this.state.lootForm.name}
                                                       placeholder="항목" onChange={this.handleChange} name={"name"}></input>
                                            </div>
                                            <div className="col">
                                                <input type="text" className="form-control" value={this.state.lootForm.charname}
                                                       placeholder="이름" onChange={this.handleChange} name={"charname"}></input>
                                            </div>
                                            <div className="col">
                                                <input type="text" className="form-control" value={this.state.lootForm.income}
                                                       placeholder="수입" onChange={this.handleChange} name={"income"}></input>
                                            </div>
                                            <div className="col">
                                                <input type="text" className="form-control" value={this.state.lootForm.outgoing}
                                                       placeholder="지출" onChange={this.handleChange} name={"outgoing"}></input>
                                            </div>
                                        </div>
                                        {this.state.error &&
                                        <div className={"alert alert-warning"}>{this.state.error}</div>
                                        }
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={this.handleSubmit}>항목 추가</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col"></div>
                </div>
            </React.Fragment>
        )
    }
}

export {
    AdminLogForm, AdminLogLootTable
}