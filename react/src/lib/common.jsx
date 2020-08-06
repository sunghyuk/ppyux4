
const WeekdayNames = ["일", "월", "화", "수", "목", "금", "토"]

function compareDateDesc(a, b) {
    if (a.date > b.date) {
        return -1
    } else if (a.date < b.date) {
        return 1
    } else {
        return 0
    }
}

function getIdFromHash(hash) {
    let id
    if (hash.includes("#") && hash.length > 1) {
        id = hash.substr(1)
    }
    return id
}

function getNextDays(val) {
    let d = window.moment();
    return [...Array(val).keys()].map(i => {
        const res = {"d":d.format('YYYY-MM-DD'), "w": WeekdayNames[d.day()]}
        d.add(1, 'days')
        return res
    })
}

class ViewTitle extends React.Component {
    render() {
        return (
            <div className={"row"}>
                <div className={"col-3 pt-2 pb-2 text-left"}>{this.props.back}</div>
                <div className={"col"}>{this.props.title}</div>
                <div className={"col-3"}></div>
            </div>
        )
    }
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
        // You can also log error messages to an error reporting service here
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="row">
                    <div className="col"></div>
                    <div className="col-8 alert alert-secondary" role="alert">
                        <h4 className="alert-heading">오류가 발생했습니다. </h4>
                        <hr />
                        <pre className={"text-left"}>
                            <code>
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo.componentStack}
                            </code>
                        </pre>
                        <hr />
                        <p className="mb-0 text-right">공대 오픈톡방에 알려주세요.</p>
                    </div>
                    <div className="col"></div>
                </div>
            )
        }

        return this.props.children;
    }
}

export {
    WeekdayNames,
    compareDateDesc,
    getIdFromHash,
    getNextDays,
    ViewTitle,
    ErrorBoundary
}