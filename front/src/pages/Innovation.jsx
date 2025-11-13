import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import '../styles/theme.css';

function Innovation() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <meta charset="UTF-8" />
                <title>테마 선택</title>
            </Helmet>
            <div className="result-container">
                <h1 className="result-title">
                    당신은 <p>혁신</p> 성향의 투자자입니다.
                </h1>

                <div className="theme-container">
                    <h2>혁신 테마 ETF 목록</h2>
                    <div class="theme-button-container">
                        <button class="theme-btn">자동화 인공지능</button>
                        <button class="theme-btn">친환경 에너지</button>
                        <button class="theme-btn">원자력</button>
                        <button class="theme-btn">바이오, 제약</button>
                        <button class="theme-btn">전기차, 수소차</button>
                        <button class="theme-btn">반도체</button>
                        <button class="theme-btn">우주산업</button>
                        <button class="theme-btn">친환경 소재</button>
                        <button class="theme-btn">사이버 보안</button>
                        <button class="theme-btn">핀테크</button>
                    </div>
                </div>
                

                <button className="result-btn" onClick={() => navigate('/portfolio')}>
                    선택한 테마로 포트폴리오 만들기
                </button>
            </div>
        </>
    )
}

export default Innovation;