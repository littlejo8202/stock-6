import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/theme.css";

function Traditional() {
    const navigate = useNavigate();
    const [selectedThemes, setSelectedThemes] = useState([]);

    const themes = [
        "정유, 석유, 가스 에너지", "철강, 금속, 기초소재", "금융", "소비재", "전기, 가스, 수도",
        "부동산, 건설", "통신", "자동차, 조선 제조", "헬스케어, 전통제약", "화학산업"
    ]

    const toggleTheme = (theme) => {
        if (selectedThemes.includes(theme)) {
            setSelectedThemes(selectedThemes.filter(t => t !== theme));
        } else {
            // [버그 수정] selectedModules -> selectedThemes
            setSelectedThemes([...selectedThemes, theme]);
        }
    };

    const handleCreatePortfolio = async () => {
        if (selectedThemes.length === 0) {
            alert("하나 이상의 테마를 선택해주세요.");
            return;
        }

        // --- (수정) API 호출 로직 '삭제' ---
        // 'themes'만 Portfolio 페이지로 넘깁니다.
        navigate('/portfolio', { state: { themes: selectedThemes } });
    };

    return (
        <>
            <Helmet>
                <meta charSet="UTF-8" /> 
                <title>테마 선택</title>
            </Helmet>
            <div className="result-container">
                <h1 className="result-title">
                    당신은 <p>전통</p> 성향의 투자자입니다.
                </h1>

                <div className="theme-container">
                    <h2>전통 성향의 테마 ETF 목록</h2>
                     {/* (수정) 'class=' -> 'className=' */}
                    <div className="theme-button-container">
                        {themes.map((theme, index) => (
                            <button
                                key={index}
                                className={`theme-btn ${selectedThemes.includes(theme) ? 'selected' : ''}`}
                                onClick={() => toggleTheme(theme)}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="result-btn" onClick={handleCreatePortfolio}>
                    선택한 테마로 포트폴리오 만들기
                </button>
            </div>
        </>
        
    )
}

export default Traditional;
