import Client from './lib/fb.js'
import {
    getIdFromHash, ViewTitle
} from "./lib/common.js";
import {
    AuthProvider,AuthContext
} from "./lib/fb.js";
import {
    NewScheduleForm, NewScheduleButton, ApplyForm, ApplyView
} from "./lib/apply.js";
import {Dungeons} from "./lib/wow.js";
import {ErrorBoundary} from "./lib/common.js";
import {ApplyLink} from "./lib/apply.js";

class ApplyPage extends React.Component {

    static contextType = AuthContext

    constructor(props) {
        super(props);
        this.client = new Client()
        const selected = getIdFromHash(props.hash)
        this.state = {
            docs: [],
            selected: selected,
            isLoaded: false,
            scheduleFormVisible: false,
            error: null
        }
    }

    componentDidMount() {
        window.addEventListener("hashchange", this.hashChanged.bind(this), false);
        this.fetchData()
    }

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.hashChanged.bind(this), false);
    }

    hashChanged() {
        const hash = window.location.hash
        const id = getIdFromHash(hash)
        this.setState({
            selected: id
        })
    }

    fetchData() {
        this.client.collectionSchedule().orderBy("dt", "desc").limit(10).get().then(snapshot => {
            let docs = []
            snapshot.forEach(doc => {
                docs.push(doc)
            })
            this.setState({
                docs: docs,
                isLoaded: true,
                error: null
            })
        }).catch(err => {
            this.setState({
                error: err
            })
        })
    }

    saveSchedule(val) {
        const dt = val.dt.split(" ").shift()
        const dh = `${val.dh}시 ${val.dm}분`
        const exists = this.state.docs.map(d => d.data()).filter(d => d.dt == dt)
            .filter(d => d.dh == dh)
            .filter(d => d.dn == val.dungeon)
            .length
        if (exists) {
            this.setState({
                error: `중복 일정이 있습니다. ${dt} ${dh} ${val.dungeon}`
            })
        }

        const auth = this.context.auth
        const dungeon = Dungeons.filter(d => d.name == val.dungeon).shift()
        const new_data = {
            max: dungeon.max,
            a: {},
            na: {},
            dt: dt,
            dw: val.dt.split('(').slice(-1).shift().split(')').shift(),
            dh: dh,
            dn: val.dungeon,
            open: true,
            memo: val.memo,
            uid: auth.uid,
            email: auth.email
        }
        console.log(new_data)
        this.client.collectionSchedule().add(new_data).then(ref => {
            ref.get().then(doc => {
                const docs = this.state.docs
                docs.unshift(doc)
                this.setState({
                    docs: docs,
                    scheduleFormVisible: false
                })
            })
        })
    }

    saveApplication(btnName, val) {
        const doc = this.state.docs.filter(d => d.id == this.state.selected).shift()
        const data = doc.data()
        delete data.a[val.n]
        delete data.na[val.n]
        if (btnName == "apply") {
            data.a[val.n] = {clas: val.c, role: val.r, dt: window.moment().format()}
            window.localStorage.setItem("a", JSON.stringify(val))
        } else if (btnName == "nonattend") {
            data.na[val.n] = {}
        }
        const ref = this.client.collectionSchedule().doc(doc.id)
        ref.update(data).then(() => {
            ref.get().then(doc => {
                const docs = this.state.docs
                const idx = docs.findIndex(d => d.id == ref.id)
                docs[idx] = doc
                this.setState({
                    selected: doc.id,
                    docs: docs
                })
            })
        })
    }

    newScheduleClick() {
        this.setState({
            scheduleFormVisible: !this.state.scheduleFormVisible
        })
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
        if (this.state.selected) {
            const doc = this.state.docs.filter(d => d.id == this.state.selected).shift()
            return (
                <React.Fragment>
                    <ApplyView doc={doc} />
                    <ApplyForm submit={this.saveApplication.bind(this)} />
                </React.Fragment>
            )
        }
        if (this.state.scheduleFormVisible) {
            const cancelBtn = (
                <NewScheduleButton visible={this.state.scheduleFormVisible} onClick={this.newScheduleClick.bind(this)} />
            )
            return (
                <React.Fragment>
                    <NewScheduleForm cancelBtn={cancelBtn} submit={this.saveSchedule.bind(this)} />
                </React.Fragment>
            )
        }
        const title = (
            <h3>예약 신청</h3>
        )
        return (
            <React.Fragment>
                <ViewTitle title={title} />
                <div className={"table-responsive text-nowrap"}>
                    <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                        <thead>
                            <tr>
                                <th>일시</th>
                                <th>던전</th>
                                <th>현황</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.docs.map(doc => {
                            return (
                                <tr key={doc.id}>
                                    <td className={"text-left"}>{doc.data().dt} ({doc.data().dw}) {doc.data().dh}</td>
                                    <td className={"text-left"}>
                                        <ApplyLink id={doc.id} name={doc.data().dn} />
                                    </td>
                                    <td>{Object.keys(doc.data().a).length} / {doc.data().max}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
                <AuthContext.Consumer>
                    {auth => {
                        if (auth && auth.admin) {
                            return (
                                <NewScheduleButton visible={this.state.scheduleFormVisible} onClick={this.newScheduleClick.bind(this)} />
                            )
                        }
                    }}
                </AuthContext.Consumer>
            </React.Fragment>
        )
    }
}

ReactDOM.render(
    <ErrorBoundary>
        <AuthProvider>
            <ApplyPage hash={window.location.hash} />
        </AuthProvider>
    </ErrorBoundary>
    ,
    document.getElementById("main-view")
)