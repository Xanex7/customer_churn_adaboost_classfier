import io
import pandas as pd
from flask import Blueprint, request, jsonify, send_file
# import your model loading and feature mapper utils here

@predict_bp.route('/predict-batch', methods=['POST'])
def predict_batch():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400

    try:
        df = pd.read_csv(file)
        
        # Run inference across rows (adapt mapping based on your feature mapper)
        predictions = []
        confidences = []
        
        for _, row in df.iterrows():
            # Apply feature transformations / model prediction logic
            pred = model.predict([row.values])[0]
            prob = max(model.predict_proba([row.values])[0]) * 100
            predictions.append("High Risk (Churn)" if pred == 1 else "Loyal Customer")
            confidences.append(f"{round(prob, 2)}%")

        df['Prediction'] = predictions
        df['Confidence'] = confidences

        # Convert back to CSV in-memory
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)

        return send_file(
            output,
            mimetype="text/csv",
            as_attachment=True,
            download_name="batch_churn_predictions.csv"
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
