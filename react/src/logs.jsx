import Client from "./lib/fb.js";
import {LogList, LogView} from "./lib/logs.js";
import {
    getIdFromHash,
    ErrorBoundary
} from "./lib/common.js";

class LogsPage extends React.Component {

    constructor(props) {
        super(props);
        let logId = LogsPage.getLogIdFromHash(props.hash)
        this.state = {
            logId: logId,
            logs: [],
            error: null,
            isLoaded: false
        }
        this.client = new Client()
    }

    componentDidMount() {
        window.addEventListener("hashchange", this.hashChanged.bind(this), false);
        this.fetchRaidLogs()
    }

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.hashChanged.bind(this), false);
    }

    static getLogIdFromHash(hash) {
        return getIdFromHash(hash)
    }

    hashChanged() {
        const hash = window.location.hash
        const logId = LogsPage.getLogIdFromHash(hash)
        this.setState({
            logId: logId
        })
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
        if (this.state.error) {
            return (
                <div>Error: {this.state.error}</div>
            )
        }
        if (this.state.logId) {
            return (
                <LogView log={this.state.logs.filter(l => l.id == this.state.logId).shift()} />
            )
        } else {
            return (
                <LogList logs={this.state.logs} />
            )
        }
    }
}

ReactDOM.render(
    <ErrorBoundary>
        <LogsPage hash={window.location.hash} />
    </ErrorBoundary>
    , document.getElementById("main-view")
)