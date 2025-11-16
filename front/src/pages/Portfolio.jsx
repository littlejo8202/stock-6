import React, {useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/portfolio.css';

function Portfolio() {
    const location = useLocation();
    const { portfolioData } = location.state || {};
    console.log("Received portfolio data:", portfolioData);
    const navigate = useNavigate();

    const [selectedPeriod, setSelectedPeriod] = useState("1m");

    if (!portfolioData) {
        return (
            <div className="portfolio-container">
                <h1>포트폴리오 데이터를 불러오는데 실패했습니다.</h1>
            </div>
        );
    }

    const chartData = portfolioData.chart.dates.map((date, index) => ({
        date,
        value: portfolioData.chart.values[index]
    }));

    const periods = {
        "1w": "1주일",
        "15d": "15일",
        "1m": "1개월",
        "3m": "3개월"
    };

    const handleOppositeTheme = () => {
        if (location.pathname.includes('innovation')) {
            navigate('/traditional');
        } else {
            navigate('/innovation');
        }
    }

    return (
        <>
            <Helmet>
                <meta charset="UTF-8" />
                <title>포트폴리오</title>
            </Helmet>
            <div className="portfolio-container">
                <h1>포트폴리오</h1>
                <div class="graph-space">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#4A90E2" strokeWidth={2}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div class="profit-section">
                    <div class="time-select">
                    <button class="time-btn" onClick={() => setSelectedPeriod("1w")}>1주일</button>
                    <button class="time-btn" onClick={() => setSelectedPeriod("15d")}>15일</button>
                    <button class="time-btn" onClick={() => setSelectedPeriod("1m")}>1개월</button>
                    <button class="time-btn" onClick={() => setSelectedPeriod("3m")}>3개월</button>
                    </div>

                    <div class="profit-text" id="profitText">
                    해당 포트폴리오의 {periods[selectedPeriod]} 
                    수익률은 <b> {(portfolioData.returns[selectedPeriod] * 100).toFixed(2)}%</b>이며,
                     위험성은 <b>{(portfolioData.risk)}</b>입니다.
                    </div>
                </div>

                <div class="bottom-buttons">
                    <button class="nav-btn-op" onClick={handleOppositeTheme}>반대 성향의 테마 알아보기</button>
                    <button class="nav-btn" onClick={() => navigate(-1)}>테마 선택 화면으로 돌아가기</button>
                    <button class="nav-btn" onClick={() => navigate('/')}>종료</button>
                </div>
            </div>
        </>
    )
        
        
}

export default Portfolio;
