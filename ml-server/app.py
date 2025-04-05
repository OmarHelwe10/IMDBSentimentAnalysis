from flask import Flask, request, jsonify
from get_latest_model import vectorizer, latest_model
import logging
from waitress import serve

# Configure logging
logging.basicConfig(
    #filename="sentiment_api.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# Initialize Flask app
app = Flask(__name__)

# Define prediction function
def predict_sentiment(text):
    sample_features = vectorizer.transform([text])
    prediction = latest_model.predict(sample_features)
    sentiment = "Positive" if prediction[0] == 1 else "Negative"
    
    # Log the prediction
    logging.info(f"Input: {text} | Prediction: {sentiment}")
    return sentiment

# Define API endpoint
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        logging.info(f"Received request: {data}")

        if "text" not in data:
            logging.warning("Request missing 'text' key")
            return jsonify({"error": "Missing 'text' key in JSON request"}), 400
        text = data["text"]
        sentiment = predict_sentiment(text)
        
        response = {"review": text, "sentiment": sentiment}
        logging.info(f"Response: {response}")
        return jsonify(response)
    
    except Exception as e:
        logging.error(f"Error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error"}), 500

# Run the Flask app with Waitress
if __name__ == '__main__':
    # Use Waitress to serve the app
    serve(app, host='0.0.0.0', port=5000)
