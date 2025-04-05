import mlflow.pyfunc
import pickle
import mlflow

# Set MLflow to track models from DagsHub
mlflow.set_tracking_uri("https://dagshub.com/OmarHelwe10/Sentiment_Analysis.mlflow")
# Load the saved vectorizer (You need to save it first!)
with open("tfidf_vectorizer.pkl", "rb") as file:
    vectorizer = pickle.load(file)

# Load the latest registered model
model_name = "SentimentAnalysisModel"
latest_model = mlflow.pyfunc.load_model(f"models:/{model_name}/latest")

# Function for inference
def predict_sentiment(text):
    sample_features = vectorizer.transform([text])
    prediction = latest_model.predict(sample_features)
    return "Positive" if prediction[0] == 1 else "Negative"

# Test
sample_text = "This movie was absolutely fantastic!"
print("Predicted Sentiment:", predict_sentiment(sample_text))
