from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import yfinance as yf
from datetime import date, timedelta
import numpy as np 

# --- 기본 설정 ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

# --- 1. CSV 데이터 미리 로드 ---
base_asset_tickers = [] 
try:
    theme_etf_path = os.path.join(DATA_DIR, '테마ETF.csv')
    df_theme_etf = pd.read_csv(theme_etf_path)
    print("--- 서버 준비: '테마ETF.csv' 파일 로드 성공 ---")
    
    commodities_path = os.path.join(DATA_DIR, '원자재ETF.csv')
    df_commodities = pd.read_csv(commodities_path)
    base_commodities = df_commodities[
        df_commodities['포트폴리오_구분'] == '기본 구성'
    ]['YAHOO_TICKER'].tolist()
    base_asset_tickers.extend(base_commodities)
    print(f"--- 서버 준비: '원자재ETF.csv' 로드 성공. 기본 자산 {base_commodities} 추가 ---")

    bonds_path = os.path.join(DATA_DIR, '채권ETF.csv')
    df_bonds = pd.read_csv(bonds_path)
    base_bonds = df_bonds[
        df_bonds['포트폴리오_구분'] == '기본 구성'
    ]['YAHOO_TICKER'].tolist()
    base_asset_tickers.extend(base_bonds)
    print(f"--- 서버 준비: '채권ETF.csv' 로드 성공. 기본 자산 {base_bonds} 추가 ---")
    
    base_asset_tickers = list(set(base_asset_tickers))
    print(f"--- 서버 준비 완료: 최종 기본 자산 티커: {base_asset_tickers} ---")
    
except FileNotFoundError as e:
    print(f"--- 서버 시작 오류: 필수 CSV 파일을 'backend/data/' 폴더에서 찾을 수 없습니다. ---")
    print(f"오류 파일: {e.filename}")
    df_theme_etf = pd.DataFrame() 
except Exception as e:
    print(f"--- 서버 시작 중 CSV 로드 오류 발생: {e} ---")
    df_theme_etf = pd.DataFrame()


# --- 2. '번역기' 딕셔너리 생성 ---
theme_name_translator = {
    # (이전과 동일)
    "자동화 인공지능": ["AI / 반도체", "인공지능", "로봇/산업"],
    "친환경 에너지": ["ESG", "에너지"],
    "원자력": ["에너지"],
    "바이오, 제약": ["바이오", "헬스케어 / 바이오", "헬스케어"],
    "전기차, 수소차": ["전기차 / 자율주행", "자동차"],
    "반도체": ["반도체"],
    "우주산업": ["방산/우주항공"],
    "친환경 소재": ["소재/산업재", "ESG"],
    "사이버 보안": ["전자/IT"], 
    "핀테크": ["금융", "전자/IT"],
    "정유, 석유, 가스 에너지": ["에너지", "소재/산업재"],
    "철강, 금속, 기초소재": ["소재/산업재"],
    "금융": ["금융"],
    "소비재": ["기타"], 
    "전기, 가스, 수도": ["에너지"], 
    "부동산, 건설": ["건설/인프라"],
    "통신": ["전자/IT"], 
    "자동차, 조선 제조": ["자동차", "조선/해운"],
    "헬스케어, 전통제약": ["헬스케어", "헬스케어 / 바이오", "바이오"],
    "화학산업": ["소재/산업재"]
}
print("--- 서버 준비 완료: 테마 이름 매핑(번역기) 생성 완료 ---")


# --- 3. 기간(period)을 실제 날짜로 변환하는 헬퍼 함수 ---
def get_period_dates(period_str):
    end_date = date.today()
    if period_str == "1w":
        start_date = end_date - timedelta(weeks=1)
    elif period_str == "15d":
        start_date = end_date - timedelta(days=15)
    elif period_str == "1m":
        start_date = end_date - timedelta(days=30)
    elif period_str == "3m":
        start_date = end_date - timedelta(days=90)
    else: 
        start_date = end_date - timedelta(days=30)
        
    return start_date.isoformat(), end_date.isoformat()


# --- [새 기능 1] Drawdown 계산 함수 ---
def calculate_drawdown(portfolio_series):
    cumulative_max = portfolio_series.cummax()
    dd_series = (portfolio_series - cumulative_max) / cumulative_max
    mdd = dd_series.min() 
    mdd_date = dd_series.idxmin() 
    return (dd_series * 100).round(2).fillna(0), f"{mdd * 100:.2f}%", mdd_date.strftime('%Y-%m-%d')

# --- [새 기능 2] Rolling Volatility 계산 함수 ---
ROLLING_WINDOW = 30 # 30일 이동 변동성
def calculate_rolling_volatility(portfolio_series, window=ROLLING_WINDOW):
    daily_returns = portfolio_series.pct_change()
    rolling_std = daily_returns.rolling(window=window).std()
    rolling_vol_series = rolling_std * np.sqrt(252)
    return (rolling_vol_series * 100).round(2).fillna(0)


# --- API 1: 테스트용 ---
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({ "message": "백엔드 서버가 응답합니다!" })

# --- API 2: 핵심 백테스팅 API (CORS 문제 수정) ---
@app.route('/api/backtest', methods=['POST', 'OPTIONS']) # (CORS 해결을 위해 'OPTIONS' 추가)
def handle_backtest():
    
    # --- (!! CORS 최종 수정 !!) ---
    # 브라우저가 보내는 'OPTIONS' (사전) 요청을 먼저 처리하고 200 OK를 반환
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight request successful"}), 200
    # --- (!! 수정 완료 !!) ---

    # --- 'POST' 요청인 경우, 기존 로직 실행 ---
    try:
        data = request.json
        frontend_themes = data.get('themes') 
        period = data.get('period') 

        if not frontend_themes or not period:
            return jsonify({"error": "themes와 period가 필요합니다."}), 400
        
        if df_theme_etf.empty:
             return jsonify({"error": "서버에 '테마ETF.csv' 파일이 로드되지 않았습니다."}), 500
        
        print(f"\n--- 요청 받음 (/api/backtest) ---")
        print(f"프론트엔드 테마: {frontend_themes}")
        print(f"선택된 기간: {period}")
        
        # --- 4. '테마' 티커 찾기 ---
        theme_tickers = []
        for fe_theme in frontend_themes:
            csv_theme_names = theme_name_translator.get(fe_theme) 
            if not csv_theme_names:
                print(f"경고: '{fe_theme}'에 대한 매핑이 없습니다. 건너뜁니다.")
                continue
            matching_rows = df_theme_etf[
                (df_theme_etf['테마'].isin(csv_theme_names)) &
                (df_theme_etf['대표여부'] == 'O')
            ]
            if not matching_rows.empty:
                ticker = matching_rows.iloc[0]['YAHOO_TICKER']
                theme_tickers.append(ticker)
                print(f"매핑 성공: '{fe_theme}' -> 티커: {ticker}")
            else:
                print(f"경고: '{fe_theme}'에 해당하는 대표 ETF('O')를 CSV에서 찾지 못했습니다.")

        if not theme_tickers:
             return jsonify({"error": "선택된 테마에 해당하는 유효한 ETF 티커를 찾지 못했습니다."}), 400
        print(f"--- 변환된 '테마' 티커 리스트: {theme_tickers} ---")
        
        # --- 5. '테마' 티커와 '기본 자산' 티커 합치기 ---
        safe_base_tickers = base_asset_tickers if base_asset_tickers else []
        final_tickers = list(set(theme_tickers + safe_base_tickers))
        print(f"--- '기본 자산' 포함 최종 티커 리스트: {final_tickers} ---")
        
        # --- 6. yfinance로 실제 데이터 가져오기 및 백테스팅 ---
        start_date, end_date = get_period_dates(period)
        
        print(f"yfinance 데이터 다운로드 중... (티커: {final_tickers}, 기간: {start_date} ~ {end_date})")
        raw_data = yf.download(final_tickers, start=start_date, end=end_date, auto_adjust=False, actions=False)

        if raw_data.empty:
            print("yfinance에서 데이터를 가져오지 못했습니다.")
            return jsonify({"error": "yfinance에서 데이터를 가져오지 못했습니다."}), 500

        close_data = raw_data['Close']
        if isinstance(close_data, pd.Series):
            close_data = close_data.to_frame(name=final_tickers[0])

        close_data = close_data.ffill().bfill() 
        normalized_data = (close_data / close_data.iloc[0]) * 100
        
        # --- (!! 70:30 비중 수정 !!) ---
        theme_portfolio = normalized_data[theme_tickers].mean(axis=1)
        
        if safe_base_tickers:
            base_portfolio = normalized_data[safe_base_tickers].mean(axis=1)
            portfolio_series = (theme_portfolio * 0.7) + (base_portfolio * 0.3)
        else:
            portfolio_series = theme_portfolio 
        # --- (!! 70:30 비율로 수정 완료 !!) ---

        # --- 7. 수익률 및 위험 지표 계산 ---
        total_return_pct = (portfolio_series.iloc[-1] / portfolio_series.iloc[0] - 1) * 100
        dd_series, mdd_value, mdd_date = calculate_drawdown(portfolio_series)
        rolling_vol_series = calculate_rolling_volatility(portfolio_series)
        
        # --- 8. (수정) 프론트엔드가 원하는 새 JSON 형식으로 응답 ---
        response_data = {
            "dates": portfolio_series.index.strftime('%Y-%m-%d').tolist(),
            "values": portfolio_series.round(2).tolist(),
            "totalReturn": f"{total_return_pct:.2f}%",
            "maxDrawdown": {
                "value": mdd_value,
                "date": mdd_date # <-- (!! 'mMdd_date' 오타 수정 완료 !!)
            },
            "drawdownSeries": dd_series.tolist(),
            "rollingVolatilitySeries": rolling_vol_series.tolist(),
            "rollingVolatilityPeriod": ROLLING_WINDOW 
        }
        
        print(f"백테스팅 성공. 총 수익률: {total_return_pct:.2f}%, MDD: {mdd_value}")
        
        return jsonify(response_data)

    except Exception as e:
        print(f"!!! 에러 발생: {e} !!!")
        import traceback
        traceback.print_exc() 
        return jsonify({"error": "서버 내부 오류가 발생했습니다.", "details": str(e)}), 500

# --- 서버 실행 ---
if __name__ == '__main__':
    app.run(port=5000, debug=True)
