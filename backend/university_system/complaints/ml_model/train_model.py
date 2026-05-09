import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from preprocess import load_and_preprocess

# Absolute path to this directory — works regardless of where script is run from
ML_DIR = os.path.dirname(os.path.abspath(__file__))

X_train, X_test, y_train, y_test, vectorizer = load_and_preprocess()

model = LogisticRegression(max_iter=1000, class_weight="balanced")
model.fit(X_train, y_train)

predictions = model.predict(X_test)
print("Model Accuracy:", accuracy_score(y_test, predictions))

joblib.dump(model,      os.path.join(ML_DIR, "complaint_model.pkl"))
joblib.dump(vectorizer, os.path.join(ML_DIR, "vectorizer.pkl"))
print("Model and vectorizer saved to:", ML_DIR)
