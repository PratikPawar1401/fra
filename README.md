***

# 🌳 Aṭavī Atlas: AI-powered FRA Atlas & WebGIS DSS

**Smart India Hackathon 2025 – Team EdgeViz**

Team Members: Pratik Pawar, Kritika Damahe, Archit Gupta, Daksh Agarwal, Samihan Narayankeri, Sandesh Awate

***

## 🚩 Problem Statement

Out of 5.1 million FRA claims filed across India, over 14% remain pending and 42% rejected, leaving 1.86 million tribal families unable to access basic rights and government schemes, often delayed for years—especially in Madhya Pradesh, Tripura, Odisha, and Telangana.

***

## ✨ Solution Overview: Aṭavī Atlas

**Aṭavī Atlas** is an AI-powered FRA Atlas and WebGIS-Based Decision Support System.  
It digitizes scattered FRA legacy records (IFR/CR/CFR), identifies village asset usage with satellite imagery and computer vision, and recommends government schemes to claimants based on their eligibility.

***

<img width="925" height="825" alt="image" src="https://github.com/user-attachments/assets/e4816811-75ee-4a9d-b139-95b2465f49ac" />

## 🛠️ Key Technical Features

- **Smart Digitization**: Layout-aware OCR + NER to extract claimant, village, rights type, and decision metadata  
- **AI-Enhanced Asset Mapping**: ML/CV detection of agricultural, forest, water, homestead areas from satellite imagery, confidence-tagged layers  
- **Intelligent DSS**: AI + rule-based recommendations matching claimants to CSS schemes (e.g., PM-KISAN), based on asset confidence scores  
- **Mobile Integration**: Flutter app for uploads, geotagging, and multilingual support—English, Hindi, Odia

***

<img width="954" height="926" alt="image" src="https://github.com/user-attachments/assets/89fdb045-be4c-4120-80c5-45010329d8c8" />

## 🔁 7-Step Workflow

1. **Data Import**: Upload/digitize FRA records  
2. **Atlas Generation**: Interactive WebGIS atlas showing claim locations  
3. **Asset Detection**: Automatic tagging of land assets  
4. **Layer Integration**: Overlay admin, forest, infrastructure layers  
5. **Scheme Recommendation**: Match government schemes to claimants  
6. **User Tools**: Filters, drawing, data export for field officers  
7. **Progress Tracking**: Claim status and system metrics dashboards

***

## ⚙️ Technical Architecture

- **Backend**: Python (FastAPI)
- **Database**: PostgreSQL, PostGIS for geospatial
- **Frontend**: React, Tailwind, Leaflet (WebGIS dashboard)
- **Mobile**: Flutter app  
- **Cloud Storage**: Cloudinary (encrypted document links)
- **Data Sources**: OpenStreetMap, ArcGIS, Google Satellite
- **AI**: LLMWhisperer (text extraction, NER), Random Forest (Sentinel-2 asset classification)
- **Explainable AI & Confidence Tags**: Transparent, rule-based logic for all recommendations

***

<img width="1245" height="857" alt="image" src="https://github.com/user-attachments/assets/888700d0-3d4f-481a-93ca-9618723f6dd0" />

## 🔒 Data Privacy & Security

- Documents stored securely in Cloudinary (encrypted)
- Claims information in PostgreSQL with role-based access
- Website login for secure protocols

***

## 💡 Impact & Benefits

- **Ministry of Tribal Affairs**: Nationwide analytics, faster reporting
- **State Tribal Welfare/Forest/Revenue Departments**: Village prioritization, improved approvals
- **District Officials**: Complete workflow & saturation lists
- **NGOs**: Track claims, use asset maps, field feedback
- **Patta Holders & Communities**: Faster claim status, access to schemes, higher trust

***

<img width="588" height="917" alt="image" src="https://github.com/user-attachments/assets/8b43be60-4b3b-4e46-b731-a81bb4f979e2" />

## 🧪 Research Foundation & Technical Viability

- Verified with open-data and real satellite sources
- AI scrapes and aggregates assets robustly
- Cost-efficient: uses free OSM & AWS, scalable cloud
- Multilingual, accessible interface

***

## 📦 Project Structure

```plaintext
atavī-atlas/
│
├── backend/  # FastAPI + ML/DSS logic
├── frontend/ # React + WebGIS dashboard
├── mobile/   # Flutter app source
├── data/     # Example & test datasets
├── docs/     # Documentation & workflow guides
├── scripts/  # Automation and ETL scripts
└── README.md # This file
```

***

## 🚀 Quick Start & Setup

```sh
# Clone repository
git clone https://github.com/PratikPawar1401/fra

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app

# Frontend setup
cd frontend
npm install
npm start

# Mobile setup
cd mobile
flutter pub get
flutter run
```

