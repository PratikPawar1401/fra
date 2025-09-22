import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
import json

# Database setup - use your actual password
DATABASE_URL = "postgresql://postgres:daksh7743@localhost:5432/fra_atlas_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claimant_name = Column(String(255), nullable=False, index=True)
    village_name = Column(String(100))
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(50), default="Odisha", index=True)
    form_type = Column(String(100), nullable=False, index=True)
    form_subtype = Column(String(50))
    status = Column(String(50), default="Pending", index=True)
    submission_date = Column(DateTime, default=func.now())
    comments = Column(Text)
    document_filename = Column(String(255))
    ocr_metadata = Column(JSON)
    extracted_fields = Column(JSON)
    latitude = Column(Float)
    longitude = Column(Float)

def view_all_claims():
    print("Atavi Atlas - Database Claims Viewer")
    print("=" * 50)
    
    db = SessionLocal()
    try:
        claims = db.query(Claim).all()
        
        if not claims:
            print("No claims found in database")
            return
        
        print(f"Found {len(claims)} claim(s) in database:")
        print()
        
        for i, claim in enumerate(claims, 1):
            print(f"CLAIM #{i} (Database ID: {claim.id})")
            print("-" * 30)
            print(f"Claimant Name: {claim.claimant_name}")
            print(f"Village: {claim.village_name}")
            print(f"District: {claim.district}")
            print(f"State: {claim.state}")
            print(f"Form Type: {claim.form_type}")
            print(f"Form Subtype: {claim.form_subtype}")
            print(f"Status: {claim.status}")
            print(f"Submitted: {claim.submission_date}")
            print(f"Document File: {claim.document_filename}")
            
            if claim.extracted_fields:
                print("Extracted OCR Fields:")
                for key, value in claim.extracted_fields.items():
                    if value and str(value).strip():  # Only show non-empty fields
                        print(f"  - {key}: {value}")
            
            if claim.ocr_metadata:
                print("OCR Processing Info:")
                if 'form_subtype' in claim.ocr_metadata:
                    print(f"  - Detected Form Type: {claim.ocr_metadata['form_subtype']}")
                if 'atlas_version' in claim.ocr_metadata:
                    print(f"  - Atlas Version: {claim.ocr_metadata['atlas_version']}")
            
            print()
            print("="*50)
            print()
            
    except Exception as e:
        print(f"Error accessing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    view_all_claims()
