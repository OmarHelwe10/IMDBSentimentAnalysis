import pandas as pd

# Load dataset
df = pd.read_csv("../dataset/IMDB Dataset.csv")

# Convert sentiment labels to binary (0: Negative, 1: Positive)
df["sentiment"] = df["sentiment"].map({"positive": 1, "negative": 0})
sample_size=5000
# Select positive and negative samples
df_pos = df[df["sentiment"] == 1].sample(sample_size, random_state=42)
df_neg = df[df["sentiment"] == 0].sample(sample_size, random_state=42)

# Combine and shuffle the dataset
df_sample = pd.concat([df_pos, df_neg]).sample(frac=1, random_state=42)

# Save version 1 dataset

df_sample.to_csv("../data_versions/imdb_v2.csv", index=False)

print(df_sample["sentiment"].value_counts())  # Ensure class balance
