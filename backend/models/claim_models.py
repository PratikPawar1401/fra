from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, Boolean
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from config.database import Base

class Claim(Base):
    """
    FRA Claims Model for Aṭavī Atlas
    Stores forest rights claims with OCR and geospatial data
    """
    __tablename__ = "claims"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic claim information
    claimant_name = Column(String(255), nullable=False, index=True)
    village_id = Column(Integer, nullable=True)  # Will link to villages table later
    village_name = Column(String(100), nullable=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(50), nullable=False, default="Odisha", index=True)
    
    # Form information
    form_type = Column(String(100), nullable=False, index=True)  # IFR, CR, CFR
    form_subtype = Column(String(50), nullable=True)  # Individual, Community, etc.
    
    # Status and workflow
    status = Column(String(50), default="Pending", index=True)
    submission_date = Column(DateTime, default=func.now(), index=True)
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Comments and notes
    comments = Column(Text)
    processing_notes = Column(Text)
    
    # Document storage
    document_url = Column(String(500))
    document_filename = Column(String(255))
    document_type = Column(String(50))  # PDF, JPG, PNG
    
    # OCR processing results
    ocr_metadata = Column(JSON)  # Store full OCR results
    extracted_fields = Column(JSON)  # Structured extracted data
    ocr_confidence = Column(Float)  # OCR processing confidence score
    ocr_processed_at = Column(DateTime)
    
    # Geospatial data (PostGIS)
    latitude = Column(Float)
    longitude = Column(Float)
    location_point = Column(Geometry('POINT'))  # PostGIS point geometry
    land_boundary = Column(Geometry('POLYGON'))  # Land boundary polygon
    
    # Atlas-specific fields
    pilot_state = Column(String(50), default="Odisha")
    atlas_version = Column(String(20), default="1.0.0")
    
    # Asset mapping results (from satellite imagery)
    land_use_classification = Column(JSON)
    forest_cover_analysis = Column(JSON)
    satellite_imagery_date = Column(DateTime)
    
    # Decision support system
    recommended_schemes = Column(JSON)
    eligibility_score = Column(Float)
    dss_processed_at = Column(DateTime)
    
    # Audit fields
    created_by = Column(Integer, nullable=True)  # User ID
    updated_by = Column(Integer, nullable=True)  # User ID
    
    def __repr__(self):
        return f"<Claim(id={self.id}, claimant='{self.claimant_name}', district='{self.district}', status='{self.status}')>"

    def to_dict(self):
        """Convert claim to dictionary for API responses"""
        return {
            "id": self.id,
            "claimant_name": self.claimant_name,
            "village_name": self.village_name,
            "district": self.district,
            "state": self.state,
            "form_type": self.form_type,
            "form_subtype": self.form_subtype,
            "status": self.status,
            "submission_date": self.submission_date.isoformat() if self.submission_date else None,
            "comments": self.comments,
            "document_filename": self.document_filename,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "pilot_state": self.pilot_state
        }
