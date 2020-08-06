import {Calendar} from './lib/calendar.js'
import Client from "./lib/fb.js";

class IndexPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            now: window.moment(),
            isLoaded: false,
            error: null,
            logs: [],
            schedules: []
        }
        this.client = new Client()
    }

    componentDidMount() {
        this.client.downloadRaidLogs((res, err) => {
            this.setState({
                isLoaded: true,
                logs: res,
                error: null
            });
            if (err) {
                this.setState({
                    isLoaded: true,
                    error: error
                });
            }
        })
        this.client.collectionSchedule().where('dt', '>=', this.state.now.format('YYYY-MM-DD')).get().then(s => {
            const schedules = []
            s.forEach(doc => {
                schedules.push(doc)
            })
            this.setState({
                schedules: schedules
            })
        })
    }

    onDateChanged(delta) {
        let date = delta > 0 ? this.state.now.add(1, 'month') : this.state.now.subtract(1, 'month')
        this.setState({
            now: date
        })
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <div>Loading...</div>
            )
        }
        return (
            <Calendar date={this.state.now} logs={this.state.logs} schedules={this.state.schedules} onChange={this.onDateChanged.bind(this)} />
        )
    }
}

ReactDOM.render(<IndexPage />, document.getElementById("main-view"))