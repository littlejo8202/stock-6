import React, { useState, useEffect } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import '../styles/portfolio.css';

// 기간(period) 변수들을 밖으로 뺌
const periods = {
    "1w": "1주일",
    "15d": "15일",
    "1m": "1개월",
    "3m": "3개월"
};

// (1) [추가] X축 날짜 포맷팅 함수 (YYYY-MM-DD -> MM-DD)
// (이 함수가 'm'으로 뜨는 문제를 해결합니다)
const formatDateTick = (tickItem) => {
    const parts = tickItem.split('-');
    if (parts.length === 3) {
        return `${parts[1]}-${parts[2]}`; // 월-일
    }
    return tickItem;
};

// (2) [추가] Y축 % 포맷팅 함수
const formatPercentTick = (tick) => `${tick.toFixed(1)}%`;
// (3) [추가] 툴팁 % 포맷팅 함수
const formatPercentTooltip = (value) => [`${Number(value).toFixed(2)}%`, ""];


function Portfolio() {
    const location = useLocation();
    const navigate = useNavigate();

    // (수정) 'portfolioData'가 아닌 'themes'를 받음
    const { themes } = location.state || {};
    
    // API 데이터를 관리할 새로운 상태(State)들 추가
    const [selectedPeriod, setSelectedPeriod] = useState("1m"); // 기간 버튼 상태
    const [portfolioData, setPortfolioData] = useState(null); // API 응답 데이터
    const [loading, setLoading] = useState(true); // 로딩 중 상태
    const [error, setError] = useState(null); // 오류 상태
    const [viewMode, setViewMode] = useState('profit'); // 'profit' 또는 'risk' 토글 상태

    // [핵심] API 호출 로직 (useEffect)
    // 'selectedPeriod'가 바뀔 때마다 API를 '다시 호출'함
    useEffect(() => {
        if (!themes || themes.length === 0) {
            setError("테마가 선택되지 않았습니다. 테마 선택 화면으로 돌아가세요.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true); 
            setError(null);   
            try {
                const response = await fetch(
                    "https://backtesting-t1xh.onrender.com/api/backtest", 
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            themes: themes,
                            period: selectedPeriod 
                        }),
                    }
                );
                const data = await response.json();

                if (!response.ok || data.error) {
                    throw new Error(data.error || "API 요청에 실패했습니다.");
                }

                setPortfolioData(data); 
                console.log("Fetched data for", selectedPeriod, data); 

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false); 
            }
        };

        fetchData(); 
        
    }, [selectedPeriod, themes]); // 'selectedPeriod'가 바뀌면 이 함수를 '재실행'

    
    const handleOppositeTheme = () => {
        if (location.pathname.includes('innovation')) {
            navigate('/traditional');
        } else {
            navigate('/innovation');
        }
    }

    // --- 로딩, 에러, 데이터 없음 상태에 따라 다른 화면 표시 ---
    if (loading) {
        return (
            <div className="portfolio-container">
                <h1>포트폴리오 분석 중...</h1>
                <p>{periods[selectedPeriod]} 기간의 데이터를 불러오는 중입니다...</p>
                <div className="bottom-buttons">
                    <button className="nav-btn" onClick={() => navigate(-1)}>테마 선택 화면으로 돌아가기</button>
                    <button className="nav-btn" onClick={() => navigate('/')}>종료</button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio-container">
                <h1>데이터를 불러오는데 실패했습니다.</h1>
                <p className="error-text">{error}</p> 
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

    // --- (성공) 데이터가 정상적으로 도착한 경우의 화면 ---
    
    // (4) [수정] 벡엔드에서 온 모든 시계열 데이터를 'chartData'로 통합
    const chartData = portfolioData.dates.map((date, index) => ({
        date,
        // 1. 수익률(%) = 가치(100~102) - 100
        profit: portfolioData.values[index] - 100, 
        // 2. 드로우다운(%)
        drawdown: portfolioData.drawdownSeries[index],
        // 3. 롤링 변동성(%)
        volatility: portfolioData.rollingVolatilitySeries[index]
    }));

    return (
        <>
            <Helmet>
                <meta charSet="UTF-8" />
                <title>포트폴리오</title>
            </Helmet>
            <div className="portfolio-container">
                <h1>포트폴리오</h1>

                {/* 수익률/위험도 토글 버튼 */}
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
                        위험도 그래프
                    </button>
                </div>

                {/* (수정) 토글 상태에 따라 다른 그래프 표시 */}
                {viewMode === 'profit' ? (
                    // --- 1. 수익률 그래프 ---
                    <div className="graph-space"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* (5) [수정] X축에 날짜 포맷터(formatDateTick) 적용 */}
                                <XAxis dataKey="date" tickFormatter={formatDateTick} />
                                {/* (6) [수정] Y축에 '%' 단위 추가 및 포맷터 적용 */}
                                <YAxis 
                                    domain={['auto', 'auto']} 
                                    unit="%" 
                                    tickFormatter={formatPercentTick}
                                />
                                {/* (7) [수정] 툴팁(마우스 오버)에도 '%' 단위 및 소수점 적용 */}
                                <Tooltip formatter={formatPercentTooltip} />
                                <Legend />
                                <Line type="monotone" dataKey="profit" name="누적 수익률" stroke="#4A90E2" strokeWidth={2} dot={false}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    // --- 2. 위험도 그래프 (2개) ---
                    <div className="graph-space risk-display"> 
                        {/* 2-1. Drawdown 그래프 */}
                        <ResponsiveContainer width="100%" height="50%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={formatDateTick} />
                                <YAxis 
                                    domain={['auto', 0]} // (Drawdown은 항상 0 이하)
                                    unit="%" 
                                    tickFormatter={formatPercentTick} 
                                />
                                <Tooltip formatter={formatPercentTooltip} />
                                <Legend />
                                <Area type="monotone" dataKey="drawdown" name="Drawdown (%)" fill="#E24A4A" stroke="#E24A4A" dot={false}/>
                            </ComposedChart>
                        </ResponsiveContainer>
                        
                        {/* 2-2. Rolling Volatility 그래프 */}
                        <ResponsiveContainer width="100%" height="50%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={formatDateTick} />
                                <YAxis 
                                    domain={['auto', 'auto']} 
                                    unit="%" 
                                    tickFormatter={formatPercentTick} 
                                />
                                <Tooltip formatter={formatPercentTooltip} />
                                <Legend />
                                <Line type="monotone" dataKey="volatility" name={`${portfolioData.rollingVolatilityPeriod}일 이동 변동성 (%)`} stroke="#F5A623" strokeWidth={2} dot={false}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="profit-section">
                    <div className="time-select">
                        <button className={`time-btn ${selectedPeriod === '1w' ? 'active' : ''}`} onClick={() => setSelectedPeriod("1w")}>1주일</button>
                        <button className={`time-btn ${selectedPeriod === '15d' ? 'active' : ''}`} onClick={() => setSelectedPeriod("15d")}>15일</button>
                        <button className={`time-btn ${selectedPeriod === '1m' ? 'active' : ''}`} onClick={() => setSelectedPeriod("1m")}>1개월</button>
                        <button className={`time-btn ${selectedPeriod === '3m' ? 'active' : ''}`} onClick={() => setSelectedPeriod("3m")}>3개월</button>
                    </div>

                    {/* (수정) 벡엔드 새 데이터 형식에 맞춤 */}
                    <div className="profit-text" id="profitText">
                        해당 포트폴리오의 {periods[selectedPeriod]} 
                        수익률은 <b> {portfolioData.totalReturn}</b>이며,
                        최대 손실(MDD)은 <b> {portfolioData.maxDrawdown.value}</b>입니다.
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
