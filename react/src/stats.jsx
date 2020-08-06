import Client from "./lib/fb.js";
import ItemDB from "./lib/itemdb.js";
import * as wow from './lib/wow.js';
import {ViewTitle} from "./lib/common.js";
import {ErrorBoundary} from "./lib/common.js";

class TierStat extends React.Component {

    constructor(props) {
        super(props);

        this.title = (
            <h4>Tier 아이템 통계</h4>
        )
        this.state = {
            items: this.statTierCount()
        }
    }

    statTierCount() {
        const logs = this.props.logs
        const agg = logs.flatMap(log => log.loot)
            .filter(i => i.name in ItemDB)
            .map(item => {
                item.tier = ItemDB[item.name].tier
                item.clas = ItemDB[item.name].clas
                return item
            })
            .filter(item => item.tier)
            .reduce((acc, cur) => {
                if (cur.clas in acc) {
                    acc[cur.clas].tier1 += (cur.tier == "1") ? 1 : 0
                    acc[cur.clas].tier2 += (cur.tier == "2") ? 1 : 0
                    acc[cur.clas].tier25 += (cur.tier == "25") ? 1 : 0
                    acc[cur.clas].tier3 += (cur.tier == "3") ? 1 : 0
                } else {
                    acc[cur.clas] = {
                        clas: cur.clas,
                        tier1: (cur.tier == "1") ? 1 : 0,
                        tier2: (cur.tier == "2") ? 1 : 0,
                        tier25: (cur.tier == "25") ? 1 : 0,
                        tier3: (cur.tier == "3") ? 1 : 0,
                    }
                }
                return acc
            }, {})
        const items = Object.values(agg).map(i => {
            i.clas = wow.Classes.filter(c => c.name == i.clas).shift()
            return i
        }).sort((a, b) => {
            if (a.clas.order > b.clas.order) return 1
            else if (a.clas.order < b.clas.order) return -1
            else 0
        })
        return items
    }

    render() {
        return (
            <React.Fragment>
                <ViewTitle title={this.title} />
                <div className={"table-responsive text-nowrap"}>
                    <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                        <thead>
                        <tr>
                            <th>직업</th>
                            <th>Tier1</th>
                            <th>Tier2</th>
                            <th>Tier2.5</th>
                            <th>Tier3</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.items.map(item => {
                            return (
                                <tr key={item.clas.name}>
                                    <td className={`${item.clas.css} text-left`}>
                                        <img src={item.clas.icon} style={{width:"24px"}} />
                                        {item.clas.name}
                                    </td>
                                    <td className={"text-right"}>{item.tier1}</td>
                                    <td className={"text-right"}>{item.tier2}</td>
                                    <td className={"text-right"}>{item.tier25}</td>
                                    <td className={"text-right"}>{item.tier3}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        );
    }
}

class SeedStat extends React.Component {
    constructor(props) {
        super(props);

        this.title = (
            <h4>시드 통계</h4>
        )

        const stats = props.logs.filter(l => l.seed).reduce((a, c) => {
            const items = c.loot.filter(i => i.name != "분배")
                .filter(i => i.income > 0)
                .map(i => {
                    i.db = ItemDB[i.name]
                    return i
                })
            console.log(items)
            const count = items.reduce((a, c) => {
                const cat = c.db ? c.db.cat : "기타"
                if (cat in a) {
                    a[cat] += 1
                } else {
                    a[cat] = 1
                }
                return a
            }, {})
            const t = a.filter(i => i.seed == c.seed).shift()
            if (t) {
                t.count += 1
            } else {
                a.push({
                    seed: c.seed,
                    count: 1
                })
            }
            return a
        }, [])
        console.log(stats)
    }

    render() {
        return (
            <React.Fragment>
                <ViewTitle title={this.title} />
                <div className={"table-responsive text-nowrap"}>
                    <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                        <thead>
                        <tr>
                            <th>시드</th>
                            <th>Count</th>
                            <th>무기</th>
                            <th>방어구</th>
                            <th>장신구</th>
                            <th>기타</th>
                        </tr>
                        </thead>
                    </table>
                </div>
            </React.Fragment>
        )
    }
}

class StatPage extends React.Component {

    constructor(props) {
        super(props);
        this.client = new Client()
        this.state = {
            isLoaded: false,
            logs: [],
            error: null
        }
    }

    componentDidMount() {
        this.fetchRaidLogs()
    }

    fetchRaidLogs() {
        this.client.downloadRaidLogs(logs => {
            this.setState({
                logs: logs,
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

        return (
            <React.Fragment>
                <ul className="nav nav-pills mb-2" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <a className="nav-link active" id="tier-tab" data-toggle="tab" href="#tier" role="tab"
                           aria-controls="tier" aria-selected="true">Tier 아이템</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="seed-tab" data-toggle="tab" href="#seed" role="tab"
                           aria-controls="seed" aria-selected="false">시드</a>
                    </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade show active" id="tier" role="tabpanel" aria-labelledby="tier-tab">
                        <TierStat logs={this.state.logs} />
                    </div>
                    <div className="tab-pane fade" id="seed" role="tabpanel" aria-labelledby="seed-tab">
                        <SeedStat logs={this.state.logs} />
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

ReactDOM.render(
    <ErrorBoundary>
        <StatPage />
    </ErrorBoundary>
    , document.getElementById("main-view")
)