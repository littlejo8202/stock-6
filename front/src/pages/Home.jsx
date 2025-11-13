// 메인페이지
import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import logo from '../assets/marklogo-kor_eng.png'; 
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();

  const handleStartSurvey = () => {
    navigate('/survey');
  }

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <title>전통/혁신 테마별 포트폴리오</title>
      </Helmet>
      
      <div className="home-container">
        <h1 className="title">전통/혁신 테마별 포트폴리오</h1>
        <p className="subtitle">성향조사를 시작합니다</p>
        <button className="start-survey-button" onClick={handleStartSurvey}>설문 시작</button>
            
        <img src={ logo } alt="가천대학교 로고" className="logo" />
        <div className="team-text">데이터처리 프로그램 6조</div>
      </div>
    </>
  );
}

export default Home;