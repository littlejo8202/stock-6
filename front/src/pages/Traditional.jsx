import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/theme.css";

function Traditional() {
    return (
        <>
            <Helmet>
                <meta charset="UTF-8" />
                <title>테마 선택</title>
            </Helmet>
            <div className="result-container">
                <h1 className="result-title">
                    당신은 <p>전통</p> 성향의 투자자입니다.
                </h1>

                <div className="theme-container">
                    <h2>해당 성향의 테마 ETF 목록</h2>
                    <div class="theme-button-container">
                        <button class="theme-btn">정유, 석유, 가스 에너지</button>
                        <button class="theme-btn">철강, 금속, 기초소재</button>
                        <button class="theme-btn">금융</button>
                        <button class="theme-btn">소비재</button>
                        <button class="theme-btn">전기, 가스, 수도</button>
                        <button class="theme-btn">부동산, 건설</button>
                        <button class="theme-btn">통신</button>
                        <button class="theme-btn">자동차, 조선 제조</button>
                        <button class="theme-btn">헬스케어, 전통제약</button>
                        <button class="theme-btn">화학산업</button>

                    </div>
                </div>

                <button className="result-btn" onClick={() => navigate('/portfolio')}>
                    선택한 테마로 포트폴리오 만들기
                </button>
            </div>
        </>
        
    )
}

export default Traditional;