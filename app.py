# -*- coding: utf-8 -*-
"""
SpamShield AI - Machine Learning Flask Server
Trains a live TF-IDF + Multinomial Naive Bayes pipeline on startup
and exposes a prediction API with word-level feature impact scores.
"""

import os
import re
import math
from flask import Flask, request, jsonify, send_from_directory

# Try importing ML libraries; fall back gracefully with logging if not installed yet
try:
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False

app = Flask(__name__, static_folder='.', static_url_path='')

# -------------------------------------------------------------------------
# Synthetic Dataset for Startup Training
# -------------------------------------------------------------------------
TRAINING_DATA = [
    # Spam Messages
    ("WINNER! You have won a free cash prize of £1000! Claim now by calling 09061701461. Urgent!", "Spam"),
    ("URGENT! Your mobile number was selected for a £2000 prize. Call 09066362206 to claim your gift card.", "Spam"),
    ("FREE ringtone! Reply with TONE to 8007 to subscribe. Charges £1.50/week. Stop to cancel.", "Spam"),
    ("Congratulations! You won a free Walmart gift card. Click this link to verify your login account.", "Spam"),
    ("Double your cash today! Text LOAN to 55512. Fast approval, no credit check required!", "Spam"),
    ("Dear customer, your bank account has been locked. Verify login details at security-link.com", "Spam"),
    ("Weekly sweepstakes winner! Text WIN to 7771 for a chance to win a brand new Nokia mobile!", "Spam"),
    ("Get a cheap loan now! Low interest rate guaranteed. Reply for info. Cash in your account today.", "Spam"),
    ("Hot dating singles near you! Chat now, reply sex to 88910. Only £1.50 per msg. Stop to exit.", "Spam"),
    ("Private message! Your account has been selected. Urgent action required. Call 08000930705.", "Spam"),
    ("Guaranteed credit card approval! No deposit, no credit score check. Apply at credit-now.info", "Spam"),
    ("Your package delivery is pending. Please verify your address and pay shipping fee at postal-track.net", "Spam"),
    ("Get free followers and likes instantly! No password needed. Boost your social media today at boost-social.com", "Spam"),
    ("IMPORTANT NOTICE: Your tax refund of $480 is ready. Claim your rebate at tax-refund-portal.gov.us", "Spam"),
    ("Adult chat lines. Meet sexy local girls. Send text to 69696. Call charges apply. Stop to end.", "Spam"),
    ("Congratulations! You are selected to win a free cruise trip to Bahamas. Call 1800-CRUISE to register.", "Spam"),
    ("Double your income working from home! Only 2 hours a day. No experience needed. Click home-wealth.biz", "Spam"),
    ("Final warning: your subscription will expire in 24 hours. Renew now to avoid service interruption.", "Spam"),
    ("Congratulations, you have won a cash prize! Reply claim to collect. Terms and conditions apply.", "Spam"),
    ("Get cash fast! Bad credit ok. Instant approval online. Apply in minutes.", "Spam"),
    
    # Legitimate Messages (Ham)
    ("Hey, are we still meeting for lunch today? Let me know.", "Legitimate"),
    ("I'm on my way home now. Will be there in ten minutes. See you soon.", "Legitimate"),
    ("Sorry, I'm busy in a meeting right now. I will call you back later tonight.", "Legitimate"),
    ("Can you send me the project files before tomorrow's class? Need to review them.", "Legitimate"),
    ("Hey mum, did you leave the house keys in the kitchen drawer or the table?", "Legitimate"),
    ("Yeah, that sounds great! Let's do dinner at 7 PM at that Italian place.", "Legitimate"),
    ("Ok, no problem. See you tomorrow at school. Good luck with the exam!", "Legitimate"),
    ("What are you doing tonight? Want to hang out or watch a movie?", "Legitimate"),
    ("I'm studying at the library right now. Speak to you soon, take care.", "Legitimate"),
    ("Happy birthday! I hope you have an amazing day filled with joy and laughter!", "Legitimate"),
    ("Hi, just checking if you reached home safely. Let me know when you get a chance.", "Legitimate"),
    ("Could you please buy some milk and bread on your way back from work?", "Legitimate"),
    ("I will be a bit late for the meeting. Please start without me if needed.", "Legitimate"),
    ("Thanks for the help yesterday! I really appreciate your support.", "Legitimate"),
    ("Are you free this weekend? We are planning a small get-together at my place.", "Legitimate"),
    ("Don't forget to submit the assignment by midnight. The professor is very strict.", "Legitimate"),
    ("I am heading to the gym now, talk to you later.", "Legitimate"),
    ("Did you watch the match last night? It was an incredible game!", "Legitimate"),
    ("Perfect, I'll book the tickets for the afternoon show then. See you there.", "Legitimate"),
    ("Let's grab a coffee tomorrow morning before we head to the office.", "Legitimate")
]

# -------------------------------------------------------------------------
# Machine Learning Model Setup
# -------------------------------------------------------------------------
vectorizer = None
model = None

def train_model():
    global vectorizer, model
    if not HAS_ML_LIBS:
        print("Scikit-learn or numpy is not installed. Running in mock simulation mode.")
        return
    
    print("Training Naive Bayes spam classification pipeline...")
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]
    
    # Initialize TF-IDF Vectorizer (lowercasing, sublinear term frequency)
    vectorizer = TfidfVectorizer(
        lowercase=True,
        token_pattern=r'(?u)\b\w\w+\b',
        sublinear_tf=True
    )
    
    X = vectorizer.fit_transform(texts)
    y = np.array(labels)
    
    # Train Multinomial Naive Bayes Model
    model = MultinomialNB(alpha=1.0)
    model.fit(X, y)
    print("Model training successfully completed. Classes:", model.classes_)

# Train on startup if libraries are available
train_model()

# -------------------------------------------------------------------------
# Static File Serving Routes
# -------------------------------------------------------------------------
@app.route('/')
def index():
    """Serves the main frontend page."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serves CSS, JS, images and other static assets directly from root."""
    return send_from_directory('.', path)

# -------------------------------------------------------------------------
# Prediction API Endpoint
# -------------------------------------------------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    """
    Predicts whether an incoming text message is Spam or Legitimate.
    Returns:
        JSON payload containing the classification label, confidence score,
        and a detailed word-level Naive Bayes impact breakdown.
    """
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Missing message field'}), 400
    
    message = data['message']
    
    # If ML libraries are missing, or training failed, use a smart Python-based heuristic fallback
    if not HAS_ML_LIBS or model is None or vectorizer is None:
        return run_heuristic_prediction(message)
        
    try:
        # Transform input message using the trained TF-IDF vectorizer
        vector = vectorizer.transform([message])
        
        # Get probability estimates (classes are ['Legitimate', 'Spam'])
        probs = model.predict_proba(vector)[0]
        
        classes = model.classes_
        legit_prob = probs[0]
        spam_prob = probs[1]
        
        # Determine winning label
        is_spam = spam_prob >= 0.5
        label = "Spam" if is_spam else "Legitimate"
        probability = spam_prob if is_spam else legit_prob
        
        # Extract word-level impact scores using Naive Bayes weights
        # We split the message into word tokens and look up their log probabilities in the model
        words = re.findall(r'\b\w\w+\b', message.lower())
        impact_words = []
        
        feature_names = vectorizer.get_feature_names_out()
        vocab = vectorizer.vocabulary_
        
        # Feature log probabilities: shape (n_classes, n_features)
        # Class index 0 = Legitimate (Ham), Class index 1 = Spam
        log_probs = model.feature_log_prob_
        
        for word in set(words):
            if word in vocab:
                idx = vocab[word]
                # Log probabilities
                log_prob_ham = log_probs[0][idx]
                log_prob_spam = log_probs[1][idx]
                
                # Convert log probabilities to relative likelihood
                prob_spam_raw = math.exp(log_prob_spam)
                prob_ham_raw = math.exp(log_prob_ham)
                
                # Relative ratio (P(Spam | Word))
                total = prob_spam_raw + prob_ham_raw
                if total > 0:
                    spam_likelihood = prob_spam_raw / total
                else:
                    spam_likelihood = 0.5
                
                # Filter for words that have a meaningful pull (not perfectly neutral 0.5)
                if abs(spam_likelihood - 0.5) > 0.05:
                    impact_words.append({
                        'word': word,
                        'score': round(spam_likelihood, 3),
                        'type': 'spam' if spam_likelihood >= 0.5 else 'ham'
                    })
        
        return jsonify({
            'label': label,
            'probability': round(float(probability), 4),
            'impact_words': impact_words,
            'engine': 'Scikit-Learn MultinomialNB'
        })
        
    except Exception as e:
        print(f"Error executing Scikit-Learn prediction: {e}. Falling back to heuristics.")
        return run_heuristic_prediction(message)

def run_heuristic_prediction(message):
    """
    A pure Python backup heuristic classifier matching the JS fallback structure.
    Calculates statistical weights of trigger words and returns formatted JSON response.
    """
    cleaned = re.sub(r'[^a-z0-9\s]', '', message.lower())
    tokens = [w for w in cleaned.split() if len(w) > 1]
    
    spam_keywords = {
        'free': 0.85, 'win': 0.90, 'winner': 0.92, 'cash': 0.88, 'prize': 0.91,
        'claim': 0.87, 'call': 0.65, 'txt': 0.80, 'text': 0.55, 'urgent': 0.82,
        'now': 0.52, 'apply': 0.62, 'credit': 0.75, 'offer': 0.70, 'guaranteed': 0.80,
        'won': 0.86, 'selected': 0.78, 'gift': 0.75, 'card': 0.68, 'reply': 0.72,
        'stop': 0.74, 'mobile': 0.68, 'service': 0.60, 'loan': 0.88, 'rate': 0.65,
        'click': 0.78, 'link': 0.80, 'website': 0.72, 'subscription': 0.82, 'expires': 0.80,
        'nokia': 0.75, 'chat': 0.70, 'sexy': 0.85, 'dating': 0.78, 'congratulations': 0.95,
        'congrats': 0.90, 'draw': 0.78, 'code': 0.60, 'valid': 0.65, 'account': 0.68,
        'verify': 0.84, 'bank': 0.70, 'security': 0.62, 'update': 0.58, 'login': 0.82
    }
    
    ham_keywords = {
        'i': 0.1, 'my': 0.1, 'me': 0.1, 'we': 0.1, 'he': 0.15, 'she': 0.15,
        'home': 0.08, 'school': 0.05, 'office': 0.1, 'work': 0.12, 'class': 0.08,
        'sorry': 0.06, 'later': 0.05, 'busy': 0.06, 'meeting': 0.12, 'okay': 0.05,
        'ok': 0.05, 'tomorrow': 0.08, 'lunch': 0.08, 'dinner': 0.08, 'coming': 0.1,
        'there': 0.12, 'here': 0.12, 'project': 0.1, 'study': 0.08, 'parent': 0.05,
        'mum': 0.04, 'dad': 0.04, 'friend': 0.1, 'love': 0.08, 'lol': 0.05,
        'hey': 0.1, 'whats': 0.1, 'doing': 0.1, 'going': 0.1, 'know': 0.12
    }
    
    spam_count = 0
    ham_count = 0
    impact_words = []
    
    for word in set(tokens):
        if word in spam_keywords:
            spam_count += 1
            impact_words.append({'word': word, 'score': spam_keywords[word], 'type': 'spam'})
        elif word in ham_keywords:
            ham_count += 1
            impact_words.append({'word': word, 'score': ham_keywords[word], 'type': 'ham'})
            
    if spam_count > 0 or ham_count > 0:
        spam_weight = spam_count * 1.8
        ham_weight = ham_count * 1.0
        spam_score = spam_weight / (spam_weight + ham_weight)
        
        # Boundary calibration
        if spam_score > 0.5:
            spam_score = 0.6 + (spam_score - 0.5) * 0.78
        else:
            spam_score = 0.4 - (0.5 - spam_score) * 0.78
    else:
        # Default low-ham score
        spam_score = 0.08 + (math.sin(len(message)) * 0.02)
        
    spam_score = max(0.01, min(0.99, spam_score))
    is_spam = spam_score >= 0.5
    label = "Spam" if is_spam else "Legitimate"
    probability = spam_score if is_spam else (1 - spam_score)
    
    return jsonify({
        'label': label,
        'probability': round(float(probability), 4),
        'impact_words': impact_words,
        'engine': 'Python Heuristic Fallback Engine'
    })

if __name__ == '__main__':
    # Flask port mapping (default to 5000)
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting SpamShield AI web app on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
