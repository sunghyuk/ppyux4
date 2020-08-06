import {Calendar} from './lib/calendar.js'
import Client from "./lib/fb.js";

class NoticePage extends React.Component {

    static content = `
1. 레이드 일정
 - 사원 출시 전 : 기존과 동일
 - 사원 출시 후:  금, 일 (사원)
    (수요일 : 사원 트라이 예비일정)
 - 10시 시작 12시 종료
   > 레이드는 가능한 12시 종료를 목표로 진행할 예정이지만,
    트라이 기간 중에는 종료 시간이 연장 될 수 있음.
    : 금요일은 최대 2시까지
    : 일요일 및 수요일은 최대 1시까지
 - 사원 출시 후 검둥/화심은 운영하지 않음.

2. 사원 입찰 룰
 - 착용가능 클래스 우선
 - 200시작 / 50레이즈

3. 레이드 참여 기준
- 본캐 / 부캐 모두 참여 가능함(부캐는 7/24 일정 부터)
- 검둥 참여기준 : 화심/줄구룹 60% 이상 파밍
- 사원 참여기준 : 검둥50% + 화심/줄구룹 졸업급
   : 예외1) 검둥템 파밍이 어려운 클래스는 클래스장 확인 후 참여
   : 예외2) 클래스장 및 운영진이 동의 할 경우 참여가능
 - 탱: 3, 힐: 10~12, 딜: 나머지 인원
 - 클래스 비율대로 공대 홈페이지에서 선착순 투표
   (클래스 비율은 추후 공지 예정)

4. 공대 톡방 참여
 - 1회 이상 레이드 참여 인원 중 추후 참석 가능 인원만 초대함
   별도의 사유없이 장기간 레이드에 참석하지 않을 경우에는
   단톡방에서 강제 퇴장 예정(기간은 추후 공지 예정)

5. 공대 운영지원 가능한 공대원 모집
 - 인원 광고나 공대 운영을 지원해 주실 분을 모집합니다.
   해당 인원은 대기 순위 없이 참석 가능합니다.
 - 공대 운영 : 경매/ 공초/ 레이드 진행/ 장부 기록/ 인원 관리    
    `

    render() {
        return (
            <div className={"row"}>
                <div className={"col"}></div>
                <div className={"col-8"}>
                    <h3>공지사항</h3>
                    <hr className={"bg-light"} />
                    <pre className={"text-left text-light"}>
                        <code>
                            {NoticePage.content}
                        </code>
                    </pre>
                </div>
                <div className={"col"}></div>
            </div>
        )
    }
}

ReactDOM.render(<NoticePage />, document.getElementById("main-view"))