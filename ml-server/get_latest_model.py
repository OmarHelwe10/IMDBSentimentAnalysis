import pickle
import mlflow.pyfunc
import mlflow
import yaml

#read yaml file
with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)
    

# Set MLflow tracking URI
mlflow.set_tracking_uri("https://dagshub.com/OmarHelwe10/IMDBSentimentAnalysis.mlflow")

# Load the vectorizer
with open(config["tfidf-vectorizer"], "rb") as file:
    vectorizer = pickle.load(file)

# Load the latest registered MLflow model
model_name = "SentimentAnalysisModel"
latest_model = mlflow.pyfunc.load_model(f"models:/{model_name}/latest")