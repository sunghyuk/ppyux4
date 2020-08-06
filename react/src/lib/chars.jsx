import * as wow from '../lib/wow.js'
import {LogLink} from "../lib/logs.js";
import {ItemLink} from "../lib/items.js";
import {ViewTitle} from "../lib/common.js";

class CharView extends React.Component {
    render() {
        const c = this.props.wowchar
        const clasCss = wow.Classes.filter(wc => wc.name == c.clas).shift().css

        const titleParam = {
            back: (
                <a href={"#"} className={"btn btn-light btn-sm"}>목록</a>
            ),
            title: (
                <h3>
                    <span className={clasCss}>{c.name}</span>
                    <small className={"text-muted ml-2"}>{c.clas}</small>
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
                            <th>항목</th>
                            <th>수입</th>
                            <th>지출</th>
                        </tr>
                        </thead>
                        <tbody>
                        {c.logs.map(l => {
                            return (
                                <tr key={`${l.log.id}:${l.name}`}>
                                    <td>{l.log.date}</td>
                                    <td className={"text-left"}>
                                        <LogLink log={l.log} />
                                    </td>
                                    <td className={"text-left"}>
                                        <ItemLink item={l} />
                                    </td>
                                    <td className={"text-right"}>{wow.cooperToGold(l.outgoing)}</td>
                                    <td className={"text-right"}>{wow.cooperToGold(l.income)}</td>
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

class CharLink extends React.Component {
    constructor(props) {
        super(props);

        this.css = wow.Classes.filter(c => c.name == props.wowchar.clas).shift().css
    }
    render() {
        return (
            <a href={`/v2/chars#${this.props.wowchar.name}`} className={this.css}>{this.props.wowchar.name}</a>
        )
    }
}

export {
    CharView, CharLink
}