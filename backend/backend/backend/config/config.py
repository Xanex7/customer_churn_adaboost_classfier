import os

class Config:
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = os.environ.get("FLASK_ENV") == "development"
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "model_adaboost_classifier.pkl")
