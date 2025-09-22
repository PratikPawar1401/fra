import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON
from sqlalchemy.sql import func

# Database connection - use your actual password
DATABASE_URL = "postgresql://postgres:daksh7743@localhost:5432/fra_atlas_db"

engine = create_engine(DATABASE_URL, echo=True)
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

def create_tables():
    print("🌳 Creating FRA Atlas tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    create_tables()
