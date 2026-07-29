import os
from flask import Flask, jsonify
from flask_cors import CORS
from config.config import Config
from routes.predict_routes import predict_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(predict_bp)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "online", "model": "AdaBoostClassifier", "engine": "scikit-learn 1.6.1"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
