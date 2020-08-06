import {Calendar} from './lib/calendar.js'
import Client from "./lib/fb.js";

class MyPage extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="col"></div>
                <div className="col-8 alert alert-secondary" role="alert">
                    <h4 className="alert-heading">준비 중입니다.</h4>
                </div>
                <div className="col"></div>
            </div>
        )
    }
}

ReactDOM.render(<MyPage />, document.getElementById("main-view"))