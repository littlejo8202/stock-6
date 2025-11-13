// 설문조사
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { quizData } from "../data/quizData";
import '../styles/survey.css';

function Survey() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([...quizData]);
    const navigate = useNavigate();

    const currentQuiz = answers[currentIndex];

    // 선택지 클릭 핸들러
    const handleChoiceClick = (choiceIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentIndex].answer = newAnswers[currentIndex].choices[choiceIndex];
        setAnswers(newAnswers);
    };

    // 다음 버튼 클릭 핸들러
    const handleNextClick = () => {
        if (!currentQuiz.answer) {
            alert("답을 선택해주세요.");
            return;
        }

        if (currentIndex < answers.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            const totalScore = answers.reduce((sum, q) => sum + q.answer.score, 0);
            console.log("총 점수:", totalScore);

            const result = totalScore <= 17 ? "traditional" : "innovation";
            console.log("투자 성향:", result);
            // 결과 페이지로 이동
            if (result === "traditional") {
                navigate('/traditional');
            } else {
                navigate('/innovation');
            }
        }
    };

    return (
        <>
            <Helmet>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>투자 성향 설문 조사</title>
            </Helmet>

            <div className="survey-container">
                <div className="question" id="question">{currentQuiz.question}</div>
                <div className="choices" id="choices">
                    {currentQuiz.choices.map((choice, index) => (
                        <div
                            key={index}
                            className={`choice ${currentQuiz.answer === choice ? 'selected' : ''}`}
                            onClick={() => handleChoiceClick(index)}
                        >
                            {choice.text}
                        </div>
                    ))}
                </div>
                <button className="next-btn" id="nextBtn" onClick={handleNextClick}>
                    {currentIndex < answers.length - 1 ? '다음' : '완료'}
                </button>
            </div>
        </>
    );
}

export default Survey;