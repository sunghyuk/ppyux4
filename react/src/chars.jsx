import {CharView, CharLink} from "./lib/chars.js";
import Client from "./lib/fb.js";
import * as wow from "./lib/wow.js";
import {getIdFromHash} from "./lib/common.js";

class CharsPage extends React.Component {

    constructor(props) {
        super(props);
        this.client = new Client()
        const selected = getIdFromHash(this.props.hash)
        this.state = {
            isLoaded: false,
            chars: [],
            selected: selected,
            error: null
        }
    }

    componentDidMount() {
        window.addEventListener("hashchange", this.hashChanged.bind(this), false);
        this.fetchRaidLogs()
    }

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.hashChanged.bind(this), false);
    }

    hashChanged() {
        const hash = window.location.hash
        const selected = getIdFromHash(hash)
        this.setState({
            selected: selected
        })
    }

    fetchRaidLogs() {
        this.client.downloadRaidLogs(logs => {
            const userLogs = logs.flatMap(log => {
                return log.loot.map(l => {
                    l.log = log
                    return l
                })
            }).reduce((a, c) => {
                if (c.charname in a) {
                    a[c.charname].itemCount += (c.income > 0) ? 1 : 0
                    a[c.charname].income += c.income
                    a[c.charname].outgoing += c.outgoing
                    a[c.charname].logs.push(c)
                } else {
                    a[c.charname] = {
                        itemCount: (c.income > 0) ? 1 : 0,
                        income: c.income,
                        outgoing: c.outgoing,
                        logs: [c]
                    }
                }
                return a
            }, {})

            const userMap = logs.flatMap(l => l.users).reduce((a, c) => {
                if (!a.has(c.name)) {
                    c.count = 1
                    a.set(c.name, {...c, ...userLogs[c.name]})
                } else {
                    a.get(c.name).count += 1
                }
                return a
            }, new Map())
            const users = Array.from(userMap.values())
            users.sort((a, b) => {
                if (a.name > b.name) return 1
                else if (a.name < b.name) return -1
                else return 0
            })
            this.setState({
                chars: users,
                isLoaded: true
            })
        })
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <div>Loading...</div>
            )
        }
        if (this.state.selected) {
            const wowchar = this.state.chars.filter(i => i.name == decodeURIComponent(this.state.selected)).shift()
            return (
                <CharView wowchar={wowchar} />
            )
        }
        const chars = wow.Classes.flatMap(wc => this.state.chars.filter(c => c.clas == wc.name))
        return (
            <div className={"table-responsive text-nowrap"}>
                <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                    <thead>
                    <tr>
                        <th>이름</th>
                        <th>직업</th>
                        <th>참여</th>
                        <th>아이템</th>
                        <th>수입</th>
                        <th>지출</th>
                    </tr>
                    </thead>
                    <tbody>
                        {chars.map(c => {
                            const clasCss = wow.Classes.filter(wc => wc.name == c.clas).shift().css
                            return (
                                <tr key={c.name}>
                                    <td className={"text-left"}><CharLink wowchar={c} /></td>
                                    <td className={`text-left ${clasCss}`}>{c.clas}</td>
                                    <td className={"text-right"}>{c.count}</td>
                                    <td className={"text-right"}>{c.itemCount}</td>
                                    <td className={"text-right"}>{wow.cooperToGold(c.outgoing)}</td>
                                    <td className={"text-right"}>{wow.cooperToGold(c.income)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

ReactDOM.render(<CharsPage hash={window.location.hash} />, document.getElementById("main-view"))