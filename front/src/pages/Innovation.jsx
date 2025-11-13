import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import '../styles/theme.css';

function Innovation() {
    const navigate = useNavigate();
    const [selectedThemes, setSelectedThemes] = useState([]);

    const themes = [
        "자동화 인공지능", "친환경 에너지", "원자력", "바이오, 제약", "전기차, 수소차",
        "반도체", "우주산업", "친환경 소재", "사이버 보안", "핀테크"
    ]
    
    const toggleTheme = (theme) => {
        if (selectedThemes.includes(theme)) {
            setSelectedThemes(selectedThemes.filter(t => t !== theme));
        } else {
            setSelectedThemes([...selectedThemes, theme]);
        }
    };

    const handleCreatePortfolio = async () => {
        if (selectedThemes.length === 0) {
            alert("하나 이상의 테마를 선택해주세요.");
            return;
        }

        // const response = await fetch("/api/portfolio", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ themes: selectedThemes })
        // });

        // const data = await response.json();

        const mockData = {
            themes: selectedThemes,
        }

        navigate('/portfolio', { state: { portfolioData: mockData } });

        // navigate('/portfolio', { state: { portfolioData: data } });
    };

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

export default Innovation;