import {ItemView, ItemLink} from "./lib/items.js";
import Client from "./lib/fb.js";
import * as wow from "./lib/wow.js";
import ItemDB from "./lib/itemdb.js";
import {getIdFromHash} from "./lib/common.js";

class ItemPage  extends React.Component {

    constructor(props) {
        super(props);
        this.client = new Client()
        const selectedItem = ItemPage.getItemNameFromHash(this.props.hash)
        this.state = {
            isLoaded: false,
            items: [],
            selectedItem: selectedItem,
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

    static getItemNameFromHash(hash) {
        return getIdFromHash(hash)
    }

    hashChanged() {
        const hash = window.location.hash
        const itemName = ItemPage.getItemNameFromHash(hash)
        this.setState({
            selectedItem: itemName
        })
    }

    fetchRaidLogs() {
        this.client.downloadRaidLogs(logs => {
            const items = logs.flatMap(log => {
                return log.loot.map(l => {
                    l.log = log
                    return l
                })
            })
                .filter(l => !l.name.startsWith('기타:'))
                .filter(l => !l.name.startsWith('기부:'))
                .reduce((acc, cur) => {
                let item = acc.filter(i => i.name == cur.name).shift()
                if (item) {
                    item.count += 1
                    item.min = (cur.income < item.min) ? cur.income : item.min
                    item.max = (cur.income > item.max) ? cur.income : item.max
                    item.logs.push(cur)
                } else {
                    item = {}
                    item.name = cur.name
                    item.dungeon = cur.log.name
                    item.count = 1
                    // required to activate item link
                    item.income = 1
                    item.min = cur.income
                    item.max = cur.income
                    item.logs = [cur]
                    if (item.name in ItemDB) {
                        item.db = ItemDB[item.name]
                        item.id = item.db.id
                    }
                    acc.push(item)
                }
                return acc
            }, []).sort((a, b) => {
                if (a.name > b.name) return 1
                else if (a.name < b.name) return -1
                else return 0
            })
            this.setState({
                items: items,
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
        if (this.state.selectedItem) {
            const item = this.state.items.filter(i => i.name == decodeURIComponent(this.state.selectedItem)).shift()
            return (
                <ItemView item={item} />
            )
        }
        return (
            <div className={"table-responsive text-nowrap"}>
                <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                    <thead>
                    <tr>
                        <th>이름</th>
                        <th>던전</th>
                        <th>드랍</th>
                        <th>최저가</th>
                        <th>최고가</th>
                        <th>ItemID</th>
                        <th>Tier</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.items.map(item => {
                        return (
                            <tr key={item.name}>
                                <td className={"text-left"}><ItemLink item={item} /></td>
                                <td className={"text-left"}>{item.dungeon}</td>
                                <td className={"text-right"}>{item.count}</td>
                                <td className={"text-right"}>{wow.cooperToGold(item.min)}</td>
                                <td className={"text-right"}>{wow.cooperToGold(item.max)}</td>
                                <td>{item.id}</td>
                                <td>{"db" in item && item.db.tier}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        );
    }
}

ReactDOM.render(<ItemPage hash={window.location.hash} />, document.getElementById("main-view"))