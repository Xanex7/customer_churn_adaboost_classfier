import io
import sqlite3
import joblib
import pandas as pd
from flask import Blueprint, request, jsonify, send_file
from sklearn.ensemble import AdaBoostClassifier
from sklearn.model_selection import train_test_split

predict_bp = Blueprint('predict_bp', __name__)

# --- 1. Database Initialization ---
DB_NAME = 'predictions.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            prediction_label TEXT,
            confidence REAL,
            risk_level TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()


# --- 2. Single Inference Endpoint (with SQLite Logging) ---
@predict_bp.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # --- Your existing feature mapping & inference logic ---
        # (Example placeholder structure - replace with your actual model run logic)
        features = data  # Convert input payload to model inputs
        
        # Simulated/Actual Prediction Output
        # pred = model.predict([features])[0]
        prediction_label = "High Risk (Churn)"
        confidence = 88.5
        risk_level = "High"

        # Log prediction result into SQLite DB
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (prediction_label, confidence, risk_level) VALUES (?, ?, ?)",
            (prediction_label, confidence, risk_level)
        )
        conn.commit()
        conn.close()

        return jsonify({
            'prediction': 1,
            'prediction_label': prediction_label,
            'confidence': confidence,
            'insights': {
                'risk_level': risk_level,
                'key_drivers': ['High payment delay (>15 days)', 'Low tenure (<6 mos)'],
                'recommended_action': 'Offer immediate contract extension discount.'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- 3. Option 1: Batch CSV Prediction Endpoint ---
@predict_bp.route('/predict-batch', methods=['POST'])
def predict_batch():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Uploaded file must be a CSV'}), 400

    try:
        df = pd.read_csv(file)
        
        predictions = []
        confidences = []

        for _, row in df.iterrows():
            # Apply your feature transformation & prediction logic per row
            # pred = model.predict([row_features])[0]
            # prob = max(model.predict_proba([row_features])[0]) * 100
            
            predictions.append("High Risk" if row.get("Payment Delay", 0) > 10 else "Loyal")
            confidences.append("85.0%")

        df['Prediction'] = predictions
        df['Confidence_Score'] = confidences

        # Write output to an in-memory buffer
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype="text/csv",
            as_attachment=True,
            download_name="batch_churn_predictions.csv"
        )
    except Exception as e:
        return jsonify({'error': f'Batch execution failed: {str(e)}'}), 500


# --- 4. Option 2: Model Retraining Endpoint ---
@predict_bp.route('/retrain', methods=['POST'])
def retrain_model():
    if 'file' not in request.files:
        return jsonify({'error': 'No dataset CSV provided'}), 400

    file = request.files['file']
    try:
        df = pd.read_csv(file)
        
        # Assumes target column is named 'Churn'
        if 'Churn' not in df.columns:
            return jsonify({'error': 'CSV must contain a "Churn" column'}), 400

        X = df.drop(columns=['Churn'])
        y = df['Churn']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train new AdaBoost Ensemble
        new_model = AdaBoostClassifier(n_estimators=100, random_state=42)
        new_model.fit(X_train, y_train)

        accuracy = new_model.score(X_test, y_test)

        # Save new model overwrite
        joblib.dump(new_model, 'adaboost_model.pkl')

        return jsonify({
            'message': 'AdaBoost Classifier successfully retrained and deployed!',
            'accuracy': f"{round(accuracy * 100, 2)}%"
        })
    except Exception as e:
        return jsonify({'error': f'Retraining failed: {str(e)}'}), 500


# --- 5. Option 2: Audit History Log Fetch Endpoint ---
@predict_bp.route('/history', methods=['GET'])
def get_history():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, timestamp, prediction_label, confidence, risk_level FROM audit_logs ORDER BY id DESC LIMIT 10")
        rows = cursor.fetchall()
        conn.close()

        history = [
            {
                'id': row[0],
                'timestamp': row[1],
                'prediction_label': row[2],
                'confidence': row[3],
                'risk_level': row[4]
            }
            for row in rows
        ]

        return jsonify(history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
