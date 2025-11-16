import React, { useState, useEffect } from "react"; // (1) useEffect 추가
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/portfolio.css';

// (2) 기간(period) 변수들을 밖으로 뺌
const periods = {
    "1w": "1주일",
    "15d": "15일",
    "1m": "1개월",
    "3m": "3개월"
};

function Portfolio() {
    const location = useLocation();
    const navigate = useNavigate();

    // (3) 'portfolioData'가 아닌 'themes'를 받음
    const { themes } = location.state || {};
    
    // (4) API 데이터를 관리할 새로운 상태(State)들 추가
    const [selectedPeriod, setSelectedPeriod] = useState("1m"); // 기간 버튼 상태
    const [portfolioData, setPortfolioData] = useState(null); // API 응답 데이터
    const [loading, setLoading] = useState(true); // 로딩 중 상태
    const [error, setError] = useState(null); // 오류 상태
    const [viewMode, setViewMode] = useState('profit'); // 'profit' 또는 'risk' 토글 상태

    // (5) [핵심] API 호출 로직 (useEffect)
    // 'selectedPeriod'가 바뀔 때마다 API를 '다시 호출'함
    useEffect(() => {
        // 'themes' 정보가 없으면 실행 중단
        if (!themes || themes.length === 0) {
            setError("테마가 선택되지 않았습니다. 테마 선택 화면으로 돌아가세요.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true); // 로딩 시작
            setError(null);   // 이전 오류 제거
            try {
                const response = await fetch(
                    "https://backtesting-t1xh.onrender.com/api/backtest", // 벡엔드 주소
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            themes: themes,
                            period: selectedPeriod // (중요) 'selectedPeriod' 상태값을 API로 보냄
                        }),
                    }
                );
                const data = await response.json();

                if (!response.ok || data.error) {
                    throw new Error(data.error || "API 요청에 실패했습니다.");
                }

                setPortfolioData(data); // (성공) API 데이터를 state에 저장
                console.log("Fetched data for", selectedPeriod, data); // 로그 확인

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false); // 로딩 종료
            }
        };

        fetchData(); // 함수 실행
        
    }, [selectedPeriod, themes]); // 'selectedPeriod'가 바뀌면 이 함수를 '재실행'

    
    const handleOppositeTheme = () => {
        // (기존 코드와 동일)
        if (location.pathname.includes('innovation')) {
            navigate('/traditional');
        } else {
            navigate('/innovation');
        }
    }

    // --- (6) 로딩, 에러, 데이터 없음 상태에 따라 다른 화면 표시 ---
    if (loading) {
        return (
            <div className="portfolio-container">
                <h1>포트폴리오 분석 중...</h1>
                <p>{periods[selectedPeriod]} 기간의 데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio-container">
                <h1>데이터를 불러오는데 실패했습니다.</h1>
                <p style={{color: 'red'}}>{error}</p>
                <button className="nav-btn" onClick={() => navigate(-1)}>테마 선택 화면으로 돌아가기</button>
            </div>
        );
    }
    
    if (!portfolioData) { 
        return (
            <div className="portfolio-container">
                <h1>포트폴리오 데이터가 없습니다.</h1>
                <button className="nav-btn" onClick={() => navigate(-1)}>테마 선택 화면으로 돌아가기</button>
            </div>
        );
    }

    // --- (7) (성공) 데이터가 정상적으로 도착한 경우의 화면 ---

    // (수정) 벡엔드에서 온 데이터를 'chartData'로 변환 (오류 수정됨)
    const chartData = portfolioData.dates.map((date, index) => ({
        date,
        value: portfolioData.values[index]
    }));

    return (
        <>
            <Helmet>
                <meta charSet="UTF-Example" /> {/* "charset" 오타 수정 */}
                <title>포트폴리오</title>
            </Helmet>
            <div className="portfolio-container">
                <h1>포트폴리오</h1>

                {/* (8) [새 기능] 수익률/위험도 토글 버튼 */}
                <div className="view-mode-buttons">
                    <button 
                        className={`view-btn ${viewMode === 'profit' ? 'active' : ''}`} 
                        onClick={() => setViewMode('profit')}
                    >
                        수익률 그래프
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'risk' ? 'active' : ''}`} 
                        onClick={() => setViewMode('risk')}
                    >
                        위험도 보기
                    </button>
                </div>

                {/* (9) [새 기능] 토글 상태에 따라 다른 내용 표시 */}
                {viewMode === 'profit' ? (
                    // (수정) 'class=' -> 'className='으로 변경 (React 문법 오류 수정)
                    <div className="graph-space"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={['auto', 'auto']} /> {/* Y축 범위 자동 조절 */}
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" name="포트폴리오 가치" stroke="#4A90E2" strokeWidth={2} dot={false}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="graph-space risk-display"> 
                        <h2>포트폴리오 위험성</h2>
                        <p>연율화 변동성 (1년 기준)</p>
                        <p className="risk-value">{portfolioData.risk}</p>
                    </div>
                )}


                {/* (수정) 'class=' -> 'className='으로 변경 */}
                <div className="profit-section">
                    <div className="time-select">
                        {/* (수정) 선택된 버튼에 'active' 클래스 추가 */}
                        <button className={`time-btn ${selectedPeriod === '1w' ? 'active' : ''}`} onClick={() => setSelectedPeriod("1w")}>1주일</button>
                        <button className={`time-btn ${selectedPeriod === '15d' ? 'active' : ''}`} onClick={() => setSelectedPeriod("15d")}>15일</button>
                        <button className={`time-btn ${selectedPeriod === '1m' ? 'active' : ''}`} onClick={() => setSelectedPeriod("1m")}>1개월</button>
                        <button className={`time-btn ${selectedPeriod === '3m' ? 'active' : ''}`} onClick={() => setSelectedPeriod("3m")}>3개월</button>
                    </div>

                    {/* (수정) 벡엔드 데이터 형식에 맞춤 (오류 수정됨) */}
                    <div className="profit-text" id="profitText">
                        해당 포트폴리오의 {periods[selectedPeriod]} 
                        수익률은 <b> {portfolioData.totalReturn}</b>이며,
                        위험성은 <b> {portfolioData.risk}</b>입니다.
                    </div>
                </div>

                <div className="bottom-buttons">
                    <button className="nav-btn-op" onClick={handleOppositeTheme}>반대 성향의 테마 알아보기</button>
                    <button className="nav-btn" onClick={() => navigate(-1)}>테마 선택 화면으로 돌아가기</button>
                    <button className="nav-btn" onClick={() => navigate('/')}>종료</button>
                </div>
            </div>
        </>
    )
}

export default Portfolio;
