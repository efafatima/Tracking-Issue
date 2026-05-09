import pandas as pd
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

# Download stopwords (one time)
nltk.download('stopwords')

def load_and_preprocess():
    # Load dataset
    df = pd.read_csv("complaints/ml_model/complaints.csv")

    # Load English stopwords
    stop_words = set(stopwords.words('english'))

    # Clean text
    def clean_text(text):
        text = text.lower()
        words = text.split()
        words = [word for word in words if word not in stop_words]
        return " ".join(words)

    # Apply text cleaning
    df["clean_text"] = df["complaint_text"].apply(clean_text)

    # ✅ STEP 4: Stratified Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        df["clean_text"],
        df["category"],
        test_size=0.2,
        random_state=42,
        stratify=df["category"]
    )

    # ✅ STEP 2: Strong TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_df=0.9,
        min_df=2
    )

    # Vectorize text
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    return X_train_vec, X_test_vec, y_train, y_test, vectorizer
