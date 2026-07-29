import pandas as pd

FEATURE_NAMES = [
    "Age", "Gender", "Tenure", "Usage Frequency", "Support Calls",
    "Payment Delay", "Subscription Type", "Contract Length", "Total Spend", "Last Interaction"
]

GENDER_MAP = {"Male": 0, "Female": 1}
SUBSCRIPTION_MAP = {"Basic": 0, "Standard": 1, "Premium": 2}
CONTRACT_MAP = {"Monthly": 0, "Quarterly": 1, "Annual": 2}

def preprocess_input(data):
    gender_val = GENDER_MAP.get(str(data.get("Gender", "Female")), 1)
    sub_val = SUBSCRIPTION_MAP.get(str(data.get("Subscription Type", "Basic")), 0)
    contract_val = CONTRACT_MAP.get(str(data.get("Contract Length", "Monthly")), 0)

    raw_features = {
        "Age": float(data.get("Age", 30)),
        "Gender": gender_val,
        "Tenure": float(data.get("Tenure", 12)),
        "Usage Frequency": float(data.get("Usage Frequency", 15)),
        "Support Calls": float(data.get("Support Calls", 2)),
        "Payment Delay": float(data.get("Payment Delay", 1)),
        "Subscription Type": sub_val,
        "Contract Length": contract_val,
        "Total Spend": float(data.get("Total Spend", 500)),
        "Last Interaction": float(data.get("Last Interaction", 5))
    }

    return pd.DataFrame([raw_features])[FEATURE_NAMES]
