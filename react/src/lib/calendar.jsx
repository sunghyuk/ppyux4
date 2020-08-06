
import * as wow from '../lib/wow.js'
import * as common from '../lib/common.js'
import {ShortLogView} from '../lib/logs.js'
import {ApplyLink} from "../lib/apply.js";

function isResetDay(dungeon, date) {
    let dt = window.moment(dungeon.opened, 'YYYY-MM-DD')
    let day = window.moment(date.format('YYYY-MM-DD'), 'YYYY-MM-DD')
    while (true) {
        if (dt < day) {
            dt.add(dungeon.reset, 'days')
        } else if (dt.format('YYYY-MM-DD') == day.format('YYYY-MM-DD')) {
            return true;
        } else {
            return false;
        }
    }
}

class Calendar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            date: props.date
        }
        this.initCalendar()
    }

    initCalendar() {
        let currentDate = this.state.date
        let start = window.moment(currentDate)
        start.set('date', 1)
        start.subtract(7+7-(6-start.weekday()), 'days')

        let end = window.moment(currentDate).endOf('month')
        end.add(7+(6-end.weekday()), 'days')

        let days = []
        let weeks = [], w = null
        let dt = start
        while (dt < end) {
            if (dt.weekday() == 0) {
                w = null
            }
            if (!w) {
                w = {}
                w.key = `${dt.format('YYYY-MM')}:${weeks.length}`
                w.days = []
            }
            // deep copy
            w.days.push(window.moment(dt))
            if (w.days.length == 7) {
                weeks.push(w)
            }
            days.push(dt.format('YYYY-MM-DD'))
            dt.add(1, 'days')
        }
        this.weeks = weeks
        this.days = days
    }

    changeDate(delta) {
        this.props.onChange(delta)
    }

    render() {
        this.initCalendar()
        return (
            <React.Fragment>
                <h3>
                    <button className={"mr-3 btn btn-sm btn-light"} onClick={this.changeDate.bind(this, -1)}>이전</button>
                    {this.props.date.format('YYYY')}년 {this.state.date.format('MM')}월
                    <button className={"ml-3 btn btn-sm btn-light"} onClick={this.changeDate.bind(this, 1)}>다음</button>
                </h3>
                <div className={"table-responsive text-nowrap"}>
                    <table className={"table table-dark table-bordered table-hover table-sm"}>
                        <caption>
                            {wow.Dungeons.filter(r => "opened" in r).map(r => <span key={r.name} className={r.className}>{r.shortName}</span>)}
                            <span className={"ml-1 mr-1"}>|</span>
                            <span className={"badge badge-primary"}>공대 일정</span>
                        </caption>
                        <thead>
                        <tr>
                            {common.WeekdayNames.map(n => <th key={n}>{n}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {this.weeks.map((week) => <CalendarWeek key={week.key} days={week.days} date={this.props.date} logs={this.props.logs} schedules={this.props.schedules} />)}
                        </tbody>
                    </table>
                </div>
                <ShortLogView days={this.days} logs={this.props.logs} />
            </React.Fragment>
        );
    }
}

class CalendarWeek extends React.Component {
    constructor(props) {
        super(props);
    }
    key(day) {
        return day.format("YYYY-MM-DD")
    }
    render() {
        return (
            <tr>
                {this.props.days.map((day) => {
                    const key = this.key(day)
                    const schedule = this.props.schedules.filter(s => s.data().dt == key).shift()
                    return (
                        <CalendarDay key={key} day={day} date={this.props.date} logs={this.props.logs} schedule={schedule} />
                    )
                })}
            </tr>
        )
    }

}

class CalendarDay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reset: this.getResets()
        }
    }

    getResets() {
        return wow.Dungeons.filter(d => "opened" in d).filter(d => isResetDay(d, this.props.day))
    }

    isSameMonth() {
        return this.props.date.format("YYYY-MM") == this.props.day.format("YYYY-MM")
    }

    isToday() {
        let today = window.moment().format('YYYY-MM-DD')
        return today == this.props.day.format("YYYY-MM-DD")
    }

    getDayString() {
        return this.isSameMonth() ? this.props.day.format('D') : this.props.day.format('M.D')
    }

    render() {
        let className = (this.isSameMonth()) ? "text-right" : "text-right text-muted";
        if (this.isToday()) {
            className = "text-right text-success"
        }
        let ymd = this.props.day.format("YYYY-MM-DD")

        let scheduleHtml
        if (this.props.schedule) {
            const schedule = this.props.schedule
            const dungeon = wow.Dungeons.filter(d => d.name == schedule.data().dn).shift()
            scheduleHtml = (
                <div>
                    <span className="badge badge-primary">
                        <ApplyLink id={schedule.id} name={`${dungeon.shortName}:신청`} />
                    </span>
                </div>
            )
        }

        return (
            <td>
                <div className={className}>{this.getDayString()}</div>
                {this.state.reset.map(r => {
                    return (
                        <div key={`div:${this.props.day.format('YYYY-MM-DD')}:${r.name}`}>
                            <span key={`span:${this.props.day.format('YYYY-MM-DD')}:${r.name}`} className={r.className}>{r.shortName}</span>
                        </div>
                    )
                })}
                {this.props.logs.filter(log => log.date == ymd).map((log) => {
                    const dungeon = wow.Dungeons.filter(d => d.name == log.name).shift()
                    return (
                        <div key={`div:${log.id}`}>
                            <span key={`span:${log.id}`} className={"badge badge-primary"}>
                                <a href={`/v2/logs.html#${log.id}`}>{dungeon.shortName}</a>
                            </span>
                        </div>
                    )
                })}
                {scheduleHtml}
            </td>
        )
    }
}

export {
    Calendar
};