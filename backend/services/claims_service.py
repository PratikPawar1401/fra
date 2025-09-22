from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import Dict, Any, List, Optional

# Database setup - use your actual password
DATABASE_URL = "postgresql://postgres:your_password_here@localhost:5432/fra_atlas_db"
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

    def to_dict(self):
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
            "document_filename": self.document_filename
        }

class ClaimsService:
    def __init__(self):
        self.db = SessionLocal()
    
    def create_claim_from_ocr(self, ocr_result: Dict[str, Any], filename: str) -> Dict[str, Any]:
        """Create a new claim from OCR results"""
        try:
            if not ocr_result.get("success"):
                raise ValueError("OCR processing failed")
            
            atlas_data = ocr_result.get("atlas_claim_data", {})
            ocr_metadata = ocr_result.get("ocr_metadata", {})
            
            # Create claim
            new_claim = Claim(
                claimant_name=atlas_data.get("claimant_name", "Unknown"),
                village_name=atlas_data.get("village_name"),
                district=atlas_data.get("district", "Unknown"),
                state=atlas_data.get("state", "Odisha"),
                form_type=atlas_data.get("form_type", "Unknown"),
                form_subtype=atlas_data.get("form_subtype"),
                status="OCR Processed",
                comments=atlas_data.get("comments", ""),
                document_filename=filename,
                ocr_metadata=ocr_metadata,
                extracted_fields=atlas_data.get("extracted_data", {})
            )
            
            self.db.add(new_claim)
            self.db.commit()
            self.db.refresh(new_claim)
            
            print(f"✅ Claim saved to database: ID {new_claim.id}")
            return {
                "success": True,
                "claim_id": new_claim.id,
                "message": "Claim saved to database successfully"
            }
            
        except Exception as e:
            self.db.rollback()
            print(f"❌ Error saving claim: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_all_claims(self) -> List[Dict[str, Any]]:
        """Get all claims from database"""
        try:
            claims = self.db.query(Claim).all()
            return [claim.to_dict() for claim in claims]
        except Exception as e:
            print(f"❌ Error fetching claims: {str(e)}")
            return []
    
    def get_claim_by_id(self, claim_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific claim by ID"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            return claim.to_dict() if claim else None
        except Exception as e:
            print(f"❌ Error fetching claim {claim_id}: {str(e)}")
            return None
    
    def close(self):
        self.db.close()

# Global instance
claims_service = ClaimsService()
