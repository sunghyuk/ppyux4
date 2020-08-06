import Client from '../lib/fb.js'
import * as wow from '../lib/wow.js'
import {LogLink} from "../lib/logs.js";
import {CharLink} from "../lib/chars.js";
import {ViewTitle} from "../lib/common.js";

class ItemLink extends React.Component {
    render() {
        const item = this.props.item
        if (item.income > 0) {
            return (
                <a href={`/v2/items#${item.name}`}>{item.name}</a>
            )
        } else {
            return (
                <span className={"text-muted"}>{item.name}</span>
            )
        }
    }
}

class WowheadItemLink extends React.Component {
    componentDidMount() {
        if ($WowheadPower) {
            $WowheadPower.refreshLinks()
        }
    }

    render() {
        const item = this.props.item
        if (item.id) {
            return (
                <a href={`https://www.wowhead.com/item=${item.id}`} data-wowhead={`item=${item.id}&domain=ko.classic`} data-wh-icon-size={"medium"}>{item.name}</a>
            )
        } else {
            return (
                <React.Fragment>
                    {item.name}
                </React.Fragment>
            )
        }
    }
}

class ItemView  extends React.Component {
    render() {
        const item = this.props.item
        if (!item) {
            return (
                <div className={"alert"}>아이템 정보가 없습니다.</div>
            )
        }

        const titleParam = {
            back: (
                <a href={"#"} className={"btn btn-light btn-sm"}>목록</a>
            ),
            title: (
                <h3>
                    <WowheadItemLink item={item} />
                </h3>
            )
        }


        return (
            <React.Fragment>
                <ViewTitle {...titleParam} />
                <div className={"table-responsive text-nowrap"}>
                    <table className={"table table-dark table-striped table-bordered table-hover table-sm"}>
                        <thead>
                            <tr>
                                <th>날짜</th>
                                <th>던전</th>
                                <th>이름</th>
                                <th>금액</th>
                            </tr>
                        </thead>
                        <tbody>
                        {item.logs.map(i => {
                            const wc = i.log.users.filter(u => u.name == i.charname).shift()
                            let charLink;
                            if (wc) {
                                charLink = <CharLink wowchar={wc} />
                            } else {
                                charLink = i.charname
                            }
                            return (
                                <tr key={`${i.log.id}:${i.charname}`}>
                                    <td>{i.log.date}</td>
                                    <td>
                                        <LogLink log={i.log} />
                                    </td>
                                    <td>
                                        {charLink}
                                    </td>
                                    <td className={"text-right"}>{wow.cooperToGold(i.income)}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        )
    }
}

export {
    ItemLink, ItemView
}