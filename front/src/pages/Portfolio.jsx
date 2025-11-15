import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import '../styles/portfolio.css';

function Portfolio() {
    const location = useLocation();
    const { portfolioData } = location.state || {};
    console.log("Received portfolio data:", portfolioData);
    const navigate = useNavigate();

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
                    그래프 영역 (차트 표시 예정)
                </div>

                <div class="profit-section">
                    <div class="time-select">
                    <button class="time-btn">1주일</button>
                    <button class="time-btn">15일</button>
                    <button class="time-btn">1개월</button>
                    <button class="time-btn">3개월</button>
                    </div>

                    <div class="profit-text" id="profitText">
                    해당 포트폴리오의 [기간] 수익률은 [ ] 위험성은 []입니다.
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
