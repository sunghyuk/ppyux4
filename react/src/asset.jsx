import {ErrorBoundary, ViewTitle} from "./lib/common.js";
import {AuthProvider, AuthContext} from "./lib/fb.js";
import Client from "./lib/fb.js";

class AssetPage extends React.Component {

    static contextType = AuthContext

    constructor(props) {
        super(props);
        this.client = new Client()

        this.state = {
            value: {
                date: window.moment().format('YYYY-MM-DD'),
                name: '',
                amount: 0,
                memo: ''
            },
            error: null,
            isLoaded: false,
            doc: null
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        this.fetchDoc()
    }

    fetchDoc() {
        this.client.collectionDefault().doc('asset').get().then(doc => {
            let data
            if (doc.exists) {
                data = {}
                data.logs = doc.data().logs.reverse()
                const sum = data.logs.reduce((a, c) => {
                    if (c.name in a) {
                        a[c.name] += c.amount
                    } else {
                        a[c.name] = c.amount
                    }
                    return a
                }, {})
                data.items = Object.keys(sum).map(k => {
                    return {name: k, amount: sum[k]}
                })
            }
            this.setState({
                doc: data,
                isLoaded: true
            })
        })
    }

    handleChange(event) {
        const val = {}
        const t = event.target
        val[t.name] = t.value
        this.setState({
            value: {...this.state.value, ...val},
            error: null
        })
    }

    handleSubmit(event) {
        const val = {}
        Object.assign(val, this.state.value)
        val.cat = event.target.name
        val.amount = Number(val.amount)
        val.amount = (val.cat == 'outgoing') ? val.amount * -1 : val.amount
        val.key = `${val.name}:${window.moment().valueOf().toString(32)}`
        this.client.collectionDefault().doc('asset').get().then(doc => {
            let logs = []
            if (doc.exists) {
                logs = doc.data().logs
            }
            logs.push(val)
            this.client.collectionDefault().doc('asset').set({
                logs: logs
            }, {merge:true}).then(() => {
                this.fetchDoc()
            })
        })
    }

    getUnit(name) {
        return (name == "골드") ? "골드" : "개"
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <div>Loading...</div>
            )
        }
        if (this.state.error) {
            return (
                <div>Error: {this.state.error}</div>
            )
        }

        const auth = this.context

        const title = (
            <h3>공대 자산</h3>
        )
        const titleHistory = (
            <h3>기록</h3>
        )
        let doc = this.state.doc || {items: [], logs: []}

        return (
            <React.Fragment>
                <div className={"table-responsive text-nowrap"}>
                    <ViewTitle title={title} />
                    <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                        <thead>
                        <tr>
                            <th>항목</th>
                            <th>수량</th>
                        </tr>
                        {doc.items.filter(i => i.amount > 0).map(i => {
                            return (
                                <tr key={i.name}>
                                    <td className={"text-left"}>{i.name}</td>
                                    <td className={"text-right"}>{i.amount} {this.getUnit(i.name)}</td>
                                </tr>
                            )
                        })}
                        </thead>
                    </table>
                    <ViewTitle title={titleHistory} />
                    <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                        <thead>
                        <tr>
                            <th>일자</th>
                            <th>항목</th>
                            <th>수량</th>
                            <th>비고</th>
                        </tr>
                        {doc.logs.map(l => {
                            const css = (l.cat == "income") ? "text-primary" : "text-danger"
                            return (
                                <tr key={l.key}>
                                    <td>{l.date}</td>
                                    <td className={"text-left"}>{l.name}</td>
                                    <td className={`text-right ${css}`}>{l.amount} {this.getUnit(l.name)}</td>
                                    <td className={"text-left"}>{l.memo}</td>
                                </tr>
                            )
                        })}
                        </thead>
                    </table>
                </div>
                {(auth && auth.admin) &&
                    <div className="row">
                        <div className="col"></div>
                        <div className="col-10">
                            <div className={"modal-dialog"} style={{maxWidth:"100%"}}>
                                <div className={"modal-content"}>
                                    <div className="modal-body">
                                        <form>
                                            <div className="form-row">
                                                <div className="col form-group">
                                                    <input type="text" className="form-control" value={this.state.value.date} onChange={this.handleChange} name={"date"}></input>
                                                </div>
                                                <div className="col form-group">
                                                    <input type="text" className="form-control" value={this.state.value.name} placeholder={"항목"} onChange={this.handleChange} name={"name"}></input>
                                                </div>
                                                <div className="col form-group">
                                                    <input type="text" className="form-control" value={this.state.value.amount} onChange={this.handleChange} name={"amount"}></input>
                                                </div>
                                                <div className="col">
                                                    <input type="text" className="form-control" value={this.state.value.memo} placeholder="비고" onChange={this.handleChange} name={"memo"}></input>
                                                </div>
                                            </div>
                                            {this.state.error &&
                                            <div className={"alert alert-warning"}>{this.state.error}</div>
                                            }
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-primary" onClick={this.handleSubmit} name={"income"}>수입</button>
                                                <button type="button" className="btn btn-danger" onClick={this.handleSubmit} name={"outgoing"}>지출</button>
                                            </div>
                                        </form>
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

ReactDOM.render(
    <ErrorBoundary>
        <AuthProvider>
            <AssetPage />
        </AuthProvider>
    </ErrorBoundary>
    , document.getElementById("main-view")
)