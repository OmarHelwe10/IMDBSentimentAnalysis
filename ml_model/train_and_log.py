import pandas as pd
import nltk
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from nltk.corpus import stopwords
import mlflow
import dagshub
import os
import numpy as np
import json
import datetime

# Initialize MLflow with DagsHub
dagshub.init(repo_owner='OmarHelwe10', repo_name='imdb-sentiment-analysis', mlflow=True)

# Download stopwords
nltk.download("stopwords")

# Dataset version info
version = "v1"
dataset_path = f"../data_versions/imdb_{version}.csv"

# Load dataset
df = pd.read_csv(dataset_path)

# Train-test split
train_texts, test_texts, train_labels, test_labels = train_test_split(
    df["review"], df["sentiment"], test_size=0.2, random_state=42
)

# Model parameters
max_features = 5000
model_type = "LogisticRegression"
C_value = 1.0  # Regularization parameter
max_iter = 100  # Maximum iterations
solver = 'liblinear'  # Solver algorithm

# Preprocessing: Convert text to TF-IDF features
vectorizer = TfidfVectorizer(
    stop_words=stopwords.words("english"), 
    max_features=max_features,
    ngram_range=(1, 2)  # Include bigrams
)
X_train = vectorizer.fit_transform(train_texts)
X_test = vectorizer.transform(test_texts)

# Save the vectorizer for inference
vectorizer_path = f"../ml-server/tf-idf-vectorizers/tfidf_vectorizer_{version}.pkl"
os.makedirs(os.path.dirname(vectorizer_path), exist_ok=True)
with open(vectorizer_path, "wb") as file:
    pickle.dump(vectorizer, file)
print(f"Vectorizer saved to {vectorizer_path}")

# Set MLflow experiment name
experiment_name = "SentimentAnalysisExperiment"
mlflow.set_experiment(experiment_name)

def train_and_log_model():
    with mlflow.start_run(run_name=f"{model_type}_{version}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"):
        # Log dataset info
        mlflow.log_param("version", version)
        mlflow.log_param("dataset_path", dataset_path)
        mlflow.log_param("dataset_size", len(df))
        mlflow.log_param("train_size", len(train_texts))
        mlflow.log_param("test_size", len(test_texts))
        
        # Log feature extraction params
        mlflow.log_param("vectorizer_type", "TF-IDF")
        mlflow.log_param("max_features", max_features)
        mlflow.log_param("ngram_range", "(1,2)")
        
        # Create and log dataset statistics
        class_distribution = df["sentiment"].value_counts().to_dict()
        mlflow.log_dict(class_distribution, "class_distribution.json")
        
        # Log vocabulary size
        mlflow.log_param("vocabulary_size", len(vectorizer.vocabulary_))
        
        # Train Logistic Regression
        model = LogisticRegression(
            C=C_value, 
            max_iter=max_iter,
            solver=solver,
            random_state=42
        )
        
        # Log model parameters
        mlflow.log_param("model_type", model_type)
        mlflow.log_param("model_version", version)
        mlflow.log_param("C", C_value)
        mlflow.log_param("max_iter", max_iter)
        mlflow.log_param("solver", solver)
        
        # Train the model and log training time
        start_time = datetime.datetime.now()
        model.fit(X_train, train_labels)
        end_time = datetime.datetime.now()
        training_time = (end_time - start_time).total_seconds()
        mlflow.log_metric("training_time_seconds", training_time)

        # Make predictions
        predictions = model.predict(X_test)
        
        # Log multiple evaluation metrics
        accuracy = accuracy_score(test_labels, predictions)
        precision = precision_score(test_labels, predictions, pos_label=1)
        recall = recall_score(test_labels, predictions, pos_label=1)
        f1 = f1_score(test_labels, predictions, pos_label=1)
        
        mlflow.log_metric("accuracy", accuracy)
        mlflow.log_metric("precision", precision)
        mlflow.log_metric("recall", recall)
        mlflow.log_metric("f1_score", f1)
        
        # Log confusion matrix as a figure
        cm = confusion_matrix(test_labels, predictions)
        cm_dict = {
            "true_negative": int(cm[0][0]),
            "false_positive": int(cm[0][1]),
            "false_negative": int(cm[1][0]),
            "true_positive": int(cm[1][1])
        }
        mlflow.log_dict(cm_dict, "confusion_matrix.json")
        
        # Log example predictions (sample of 10)
        sample_indices = np.random.choice(len(test_texts), 10, replace=False)
        examples = []
        for idx in sample_indices:
            examples.append({
                "text": test_texts.iloc[idx],
                "actual": test_labels.iloc[idx],
                "predicted": predictions[idx]
            })
        mlflow.log_dict({"examples": examples}, "prediction_examples.json")

        # Save model to MLflow
        model_uri = mlflow.sklearn.log_model(
            model, 
            f"{model_type}_{version}",
            registered_model_name="SentimentAnalysisModel"
        )
        
        # Log the vectorizer as an artifact
        mlflow.log_artifact(vectorizer_path)
        


        print(f"Model trained and logged: {model_type} (Version: {version})")
        print(f"Model accuracy: {accuracy:.4f}")
        print(f"Model precision: {precision:.4f}")
        print(f"Model recall: {recall:.4f}")
        print(f"Model F1 score: {f1:.4f}")

train_and_log_model()