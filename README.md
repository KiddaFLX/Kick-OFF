# KICK-OFF

Machine Learning-Based Football Match Outcome Prediction System — NPRJ740 Phase 3 implementation.

## What it does

Select a league and two teams, and the app returns win/draw/loss probabilities from three
trained classifiers (Logistic Regression, Decision Tree, Random Forest), a model comparison
view, feature importance charts, and an optional AI-generated natural-language match analysis.

Covers six leagues: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and the PSL.

## Setup

```bash
pip install -r requirements.txt
```

## First-time setup (builds the database and trains the models)

```bash
python model_trainer.py
```

This generates `database.db` from `data/matches.csv`, trains all three models, saves them to
`models/`, and generates the confusion-matrix and feature-importance charts in
`static/charts/`.

## Run the app

```bash
python app.py
```

Then open **http://localhost:5050**.
