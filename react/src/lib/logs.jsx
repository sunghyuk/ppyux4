import * as wow from '../lib/wow.js'
import {ItemLink} from "../lib/items.js";
import {
    compareDateDesc,
    ViewTitle
} from "../lib/common.js";
import {CharLink} from "../lib/chars.js";

const cooperToGold = wow.cooperToGold

class LogData {
    constructor(data) {
        this.data = data
        this.users = data.users
        this.items = data.loot.filter(i => i.name != "분배")
        this.dist = data.loot.filter(i => i.name == "분배")
    }

    getTotalIncome() {
        return cooperToGold(getTotal(this.items.map(i => i.income)))
    }

    getTotalOutgoing() {
        return cooperToGold(getTotal(this.data.loot.map(l => l.outgoing)))
    }

    getTotalDist() {
        return cooperToGold(getTotal(this.dist.map(l => l.outgoing)))
    }

    getDistPerUser() {
        const avg = this.dist.length > 0 ? getTotal(this.dist.map(l => l.outgoing)) / this.dist.length : 0
        return cooperToGold(Math.floor(avg))
    }

    getClasColor(name) {
        const user = this.users.filter(u => u.name == name).shift()
        return (user) ? wow.Classes.filter(c => c.name == user.clas).shift().css : "text-muted"
    }
}

function getTotal(arr) {
    return arr.reduce((acc, cur) => acc + cur, 0)
}

class LogList extends React.Component {

    render() {
        const logsLength = this.props.logs.length
        return (
            <div className={"table-responsive text-nowrap"}>
                <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>날짜</th>
                            <th>던전</th>
                            <th>참여</th>
                            <th>아이템</th>
                            <th>수입</th>
                            <th>지출</th>
                            <th>분배</th>
                            <th>분배 합</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.props.logs.map((log, idx) => {
                        const row = new LogData(log)
                        return (
                            <tr key={log.id}>
                                <td>{logsLength - idx}</td>
                                <td>{row.data.date}</td>
                                <td>
                                    <LogLink log={log} />
                                </td>
                                <td>{row.users.length}</td>
                                <td>{row.items.length}</td>
                                <td className={"text-right"}>{row.getTotalIncome()}</td>
                                <td className={"text-right"}>{row.getTotalOutgoing()}</td>
                                <td className={"text-right"}>{row.getDistPerUser()}</td>
                                <td className={"text-right"}>{row.getTotalDist()}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}

/**
 *
 * props:
 *  caption - table caption
 *  users - [{name, clas, content}, ...]
 *
 */
class RaidMemberTable extends React.Component {
    static CLASS_NAMES = wow.Classes.map(c => c.name)

    constructor(props) {
        super(props);
    }

    getClasCss(clas) {
        const c = wow.Classes.filter(c => c.name == clas).shift()
        return c ? c.css : "text-muted"
    }

    render() {
        const userGroup = this.props.users.reduce((a, c) => {
            if (c.clas in a) {
                a[c.clas].push(c)
            } else {
                a[c.clas] = [c]
            }
            return a
        }, {})
        const length = Object.values(userGroup).map(g => g.length).sort().slice(-1).shift()

        return (
            <div className={"table-responsive text-nowrap"}>
                <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                    <caption>{this.props.caption}</caption>
                    <thead>
                    <tr>
                        <th>No</th>
                        {wow.Classes.map(c => {
                            return (
                                <th key={c.name} className={c.css}>
                                    <img src={c.icon} style={{width:"24px"}} />
                                    {c.name}
                                </th>
                            )
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {length > 0 && [...Array(length).keys()].map(lno => {
                        const lusers = RaidMemberTable.CLASS_NAMES.map(c => (c in userGroup) ? userGroup[c].slice(lno, lno+1).shift() : null)
                        return (
                            <tr key={lno}>
                                <td><small>{lno+1}</small></td>
                                {lusers.map((u, c) => {
                                    if (u) {
                                        const clasCss = this.getClasCss(u.clas)
                                        return (
                                            <td key={`${lno}:${c}`} className={`${clasCss} text-left`}>
                                                {u.content || u.name}
                                            </td>
                                        )
                                    } else {
                                        return (<td key={`${lno}:${c}`}></td>)
                                    }
                                })}
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}

class LogView extends React.Component {
    render() {
        const log = new LogData(this.props.log)

        const caption = (
            <React.Fragment>
                참석: {log.users.length}
                {log.data.seed &&
                <span>
                                    , 시드: {log.data.seed}
                                </span>
                }
            </React.Fragment>
        )
        const users = log.users
        users.map(u => {
            u.content = <CharLink wowchar={u} />
        })

        const titleParam = {
            back: (
                <a href={"#"} className={"btn btn-light btn-sm"}>목록</a>
            ),
            title: (
                <h3>
                    {log.data.name}
                    <small className={"text-muted ml-2"}>{log.data.date}</small>
                </h3>
            )
        }

        return (
            <React.Fragment>
                <ViewTitle {...titleParam} />
                <RaidMemberTable caption={caption} users={users} />
                <div className={"table-responsive text-nowrap"}>
                    <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                        <caption>
                            {log.data.start &&
                                <small>
                                    시작: {log.data.start},
                                    종료: {log.data.end}
                                </small>
                            }
                            {log.data.log_url &&
                                <small className={"ml-2"}>
                                    <a href={log.data.log_url}>로그 링크</a>
                                </small>
                            }
                        </caption>
                        <thead>
                            <tr>
                                <th>아이템</th>
                                <th>이름</th>
                                <th>수입</th>
                                <th>지출</th>
                            </tr>
                        </thead>
                        <tbody>
                        {log.items.map((l, idx) => {
                            const clasCss = log.getClasColor(l.charname)
                            const wc = this.props.log.users.filter(u => u.name == l.charname).shift()
                            let charLink;
                            if (wc) {
                                charLink = <CharLink wowchar={wc} />
                            } else {
                                charLink = l.charname
                            }
                            return (
                                <tr key={`${l.name}:${idx}`}>
                                    <td className={"text-left"}>
                                        <ItemLink item={l} />
                                    </td>
                                    <td className={"text-left " + clasCss}>
                                        {charLink}
                                    </td>
                                    <td className={"text-right"}>{cooperToGold(l.income)}</td>
                                    <td className={"text-right"}>{cooperToGold(l.outgoing)}</td>
                                </tr>
                            )
                        })}
                                <tr>
                                    <td>합계</td>
                                    <td></td>
                                    <td className={"text-right"}>{log.getTotalIncome()}</td>
                                    <td className={"text-right"}>{log.getTotalOutgoing()}</td>
                                </tr>
                                <tr>
                                    <td>분배</td>
                                    <td></td>
                                    <td colSpan={2} className={"text-right"}> {log.dist.length} X {log.getDistPerUser()} = {log.getTotalDist()}</td>
                                </tr>
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        )
    }
}

class ShortLogView extends React.Component{

    render() {
        return (
            <div className={"table-responsive text-nowrap"}>
                <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                    <thead>
                    <tr>
                        <th>일자</th>
                        <th>던전</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.logs.filter(log => this.props.days.includes(log.date)).sort(compareDateDesc).map(log => {
                        return (
                            <tr key={`slv:${log.id}`}>
                                <td>{log.date}</td>
                                <td>
                                    <LogLink log={log} />
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}

class LogLink extends React.Component {
    render() {
        const log = this.props.log
        return (
            <a href={`/v2/logs#${log.id}`}>{log.name}</a>
        )
    }
}

export {
    ShortLogView, LogView, LogList, LogLink, RaidMemberTable
}

