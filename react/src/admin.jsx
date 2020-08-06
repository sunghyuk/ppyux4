import {ViewTitle} from "./lib/common.js";
import {ErrorBoundary} from "./lib/common.js";
import {AuthProvider, AuthContext} from "./lib/fb.js";
import Client from "./lib/fb.js";
import * as wow from "./lib/wow.js"
import {RaidMemberTable} from "./lib/logs.js";
import {AdminLogForm} from "./lib/admin.js";
import {AdminLogLootTable} from "./lib/admin.js";

class AdminPage extends React.Component {

    static API_KEY = "{Your wow log api key}"

    static contextType = AuthContext

    constructor(props) {
        super(props);
        this.client = new Client()

        this.state = {
            value: null,
            error: null,
            phase: 0,
            isLoaded: true,
            progress: null
        }

        this.handleSubmit = this.handleSubmit.bind(this)

        this.handleLootClick = this.handleLootClick.bind(this)
        this.handleLootFormClick = this.handleLootFormClick.bind(this)
    }

    handleLootFormClick(state) {
        const form = state.lootForm
        if (!form.name) return
        if (!form.charname) return
        if (!form.income && !form.outgoing) return
        const loot = this.state.value.loot
        const key = `loot:${loot.length+1}`
        const income = Number(form.income) * 100 * 100 // gold
        const outgoing = Number(form.outgoing) * 100 * 100 // gold
        loot.push({key: key, name: form.name, charname: form.charname, income: income, outgoing: outgoing})
        const val = {...this.state.value, ...{loot: loot}}
        this.setState({
            value: val
        })
    }

    /**
     *
     * if s.find('(') > -1:
     *  return re.sub(r'^\[(.+)\]\s+\(\d+\)\s+(.+)\s+(\d+)(.)$', r'\1,\2,\3,\4', s).split(",")
     * else:
     *  return re.sub(r'^\[(.+)\]\s+(.+)\s+(\d+)(.)$', r'\1,\2,\3,\4', s).split(",")
     *
     */
    parseLedger(ledger) {
        const loot = ledger.split("\n").filter(line => line.includes("[")).map((line, idx) => {
            let itemname, charname, cat = 'income', income = 0, outgoing = 0
            if (line.includes('(')) {
                [itemname, charname, income] = line.replace(/^\[(.+)\]\s+\(\d+\)\s+(.+)\s+(\d+)(.)$/, '$1,$2,$3,$4').split(",")
            } else {
                [itemname, charname, income] = line.replace(/^\[(.+)\]\s+(.+)\s+(\d+)(.)$/, '$1,$2,$3,$4').split(",")
            }
            return {key: `loot:${idx}`, name: itemname, charname: charname, cat: cat, income: income*100*100, outgoing: outgoing}
        })
        const distPerUser = ledger.split("\n").filter(line => line.includes("회원")).shift().replace(/^.+:(\d+).+$/, "$1")
        return [loot, distPerUser]
    }

    handleLootClick(event) {
        const t = event.target
        let loot
        if (t.name == "income") {
            this.state.value.loot.forEach(v => {
                if (v.key == t.value && v.outgoing > 0) {
                    v.income = v.outgoing
                    v.outgoing = 0
                }
            })
            loot = this.state.value.loot
        } else if (t.name == "outgoing") {
            this.state.value.loot.forEach(v => {
                if (v.key == t.value && v.income > 0) {
                    v.outgoing = v.income
                    v.income = 0
                }
            })
            loot = this.state.value.loot
        } else if (t.name == "remove") {
            loot = this.state.value.loot.filter(l => l.key != t.value)
        }
        const val = {...this.state.value, ...{loot: loot}}
        this.setState({
            value: val
        })
    }

    detectDungeon(enemies) {
        if (enemies.includes("폭군 서슬송곳니")) return "검은날개 둥지"
        if (enemies.includes("오닉시아")) return "오닉시아의 둥지"
        if (enemies.includes("루시프론")) return "화산 심장부"
    }

    fetchLogAndParseLedger(state) {
        const val = state.value
        const [loot, distPerUser] = this.parseLedger(val.ledger)
        val.loot = loot
        val.dist_per_user = distPerUser

        const reportId = val.log_url.split("/").slice(-1).shift()
        const apiKey = AdminPage.API_KEY
        const reportUrl = `https://classic.warcraftlogs.com:443/v1/report/fights/${reportId}?api_key=${apiKey}`
        fetch(reportUrl).then(res => res.json()).then(data => {
            const enemies = data.enemies.map(e => e.name)
            val.name = this.detectDungeon(enemies)
            val.start = moment.unix(data.start/1000).format()
            val.end = moment.unix(data.end/1000).format()
            val.date = moment.unix(data.start/1000).format('YYYY-MM-DD')

            const enNames = wow.Classes.map(c => c.enName)
            const users = data.friendlies.filter(f => enNames.includes(f.type)).map(f => {
                const name = f.name
                const clas = wow.Classes.filter(c => c.enName == f.type).shift().name
                return {name: name, clas: clas}
            })
            val.users = users

            val.dist_per_user = Number(val.dist_per_user) * 100 * 100
            const dist = []
            users.map((u, idx) => {
                dist.push({key: `dist:${idx}`, charname: u.name, name: '분배', income: 0, outgoing: val.dist_per_user})
            })
            val.loot = val.loot.concat(dist)
            this.setState({
                value: val,
                phase: 1,
                isLoaded: true
            })
        })
    }

    updateProgress(p) {
        const progress = this.state.progress || []
        progress.push(p)
        this.setState({
            progress: progress
        })
    }

    uploadRaidLog() {
        const log = this.state.value
        log.id = this.client.collectionDefault().doc().id
        this.updateProgress(`처리 중입니다. ... ${log.date} ${log.name}`)
        this.client.downloadRaidLogs((logs) => {
            this.updateProgress(`다운로드 완료. ... 기록 ${logs.length} 건 `)
            const newLogs = [log].concat(logs)
            const version = newLogs.length
            const path = `v2/${log.region}/${log.realm}/${log.faction}/${log.team}/raid_${version}.json`

            var ref = this.client.storage.ref().child(path)
            const data = JSON.stringify(newLogs)
            const task = ref.putString(data)
            task.on('state_changed', snapshot => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        this.updateProgress('Upload is paused.');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        this.updateProgress(`Upload is running. ... ${progress.toFixed(2)}`);
                        break;
                }
            }, (err) => {
                throw err
            }, () => {
                task.snapshot.ref.getDownloadURL().then(downloadURL => {
                    this.updateProgress(`업로드 완료. ... ${path}`);
                    this.client.updateVersion({version: version, path: path}).then(() => {
                        this.updateProgress(`Version 업데이트 완료. ... ${version}`)
                    })
                });
            })
        })
    }

    handleSubmit(state) {
        if (this.state.phase == 0) {
            this.setState({
                isLoaded: false
            })
            this.fetchLogAndParseLedger(state)
        }
        if (this.state.phase == 1) {
            this.uploadRaidLog()
        }
    }

    handleBackClick() {
        if (this.state.phase == 0) return
        const phase = this.state.phase - 1;
        this.setState({
            phase: phase,
            value: this.state.value
        })
    }

    render() {
        const auth = this.context
        if (auth && !auth.admin) {
            throw Error("페이지를 열 수 없습니다. 403")
        }
        if (!this.state.isLoaded) {
            return (
                <div>Loading...</div>
            )
        }
        if (this.state.progress) {
            return (
                <div className="row">
                    <div className="col"></div>
                    <div className="col-6 text-left">
                        {this.state.progress.map((p, idx) => {
                            return (
                                <div key={idx}>{p}</div>
                            )
                        })}
                    </div>
                    <div className="col"></div>
                </div>
            )
        }
        if (this.state.phase == 0) {
            return (
                <AdminLogForm auth={auth} onSubmit={this.handleSubmit} value={this.state.value} />
            )
        }
        if (this.state.phase == 1) {
            const val = this.state.value

            const caption = (
                <React.Fragment>
                    참석: {val.users.length}
                    {val.seed &&
                    <span>
                                    , 시드: {val.seed}
                                </span>
                    }
                </React.Fragment>
            )

            const back = (
                <button className={"btn btn-light btn-sm"} onClick={this.handleBackClick.bind(this)}>뒤로</button>
            )
            const title = (
                <h3>
                    {val.name}
                    <small className={"text-muted ml-2"}>{val.date}</small>
                </h3>
            )

            return (
                <React.Fragment>
                    <ViewTitle back={back} title={title} />
                    <RaidMemberTable users={val.users} caption={caption} />
                    <AdminLogLootTable value={val} onLootChange={this.handleLootClick} onLootAdd={this.handleLootFormClick} />
                    <div className="row">
                        <div className="col"></div>
                        <div className="col-10">
                            <div className={"modal-dialog"} style={{maxWidth: "100%"}}>
                                <div className={"modal-content"}>
                                    <div className="modal-body">
                                        <button type="button" className="btn btn-danger" onClick={this.handleSubmit}>기록 저장</button>
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
}

ReactDOM.render(
    <ErrorBoundary>
        <AuthProvider>
            <AdminPage />
        </AuthProvider>
    </ErrorBoundary>
    , document.getElementById("main-view")
)
