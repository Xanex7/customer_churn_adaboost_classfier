import time
import joblib
from flask import Blueprint, request, jsonify
from config.config import Config
from utils.feature_mapper import preprocess_input
from utils.insight_generator import generate_insights

predict_bp = Blueprint("predict", __name__)

model = None
try:
    model = joblib.load(Config.MODEL_PATH)
    print("AdaBoostClassifier model successfully loaded.")
except Exception as e:
    print(f"Error loading model from {Config.MODEL_PATH}: {e}")

@predict_bp.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Machine learning model is not loaded on backend."}), 500

    start_time = time.time()
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided."}), 400

        df = preprocess_input(data)

        raw_pred = model.predict(df)[0]
        raw_prob = model.predict_proba(df)[0]

        prediction_class = int(raw_pred)
        probabilities = [float(p) for p in raw_prob]
        confidence = float(max(probabilities))

        processing_time = round((time.time() - start_time) * 1000, 2)

        insights = generate_insights(data, prediction_class, probabilities)

        return jsonify({
            "prediction": prediction_class,
            "prediction_label": "Churn Risk" if prediction_class == 1 else "Loyal Customer",
            "confidence": round(confidence * 100, 2),
            "probabilities": {
                "loyal": round(probabilities[0] * 100, 2),
                "churn": round(probabilities[1] * 100, 2)
            },
            "processing_time": f"{processing_time}ms",
            "insights": insights
        }), 200

    except Exception as e:
        return jsonify({"error": f"Inference pipeline failure: {str(e)}"}), 500
