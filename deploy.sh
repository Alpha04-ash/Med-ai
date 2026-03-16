#!/bin/bash

# MyHealthAI Automated Deployment Script
# Purpose: Automate the deployment of MyHealthAI to Google Cloud Run
# Created for the Gemini Live Agent Challenge

echo "🚀 Starting MyHealthAI Automated Deployment..."

# 1. Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

echo "📍 Using Project: $PROJECT_ID in Region: $REGION"

# 2. Enable APIs
echo "⚙️ Enabling Google Cloud APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 3. Build and Deploy Backend
echo "📦 Building Backend..."
gcloud builds submit ./backend --tag gcr.io/$PROJECT_ID/myhealth-backend

echo "🚀 Deploying Backend to Cloud Run..."
gcloud run deploy myhealth-backend \
  --image gcr.io/$PROJECT_ID/myhealth-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

# 4. Build and Deploy Frontend
echo "📦 Building Frontend..."
gcloud builds submit ./frontend --tag gcr.io/$PROJECT_ID/myhealth-frontend

echo "🚀 Deploying Frontend to Cloud Run..."
gcloud run deploy myhealth-frontend \
  --image gcr.io/$PROJECT_ID/myhealth-frontend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "✅ Deployment Complete! Check your Cloud Run console for URLs."
