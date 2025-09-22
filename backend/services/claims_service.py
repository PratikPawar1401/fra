from sqlalchemy import create_engine, desc, func, and_, or_
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Database setup - uses environment variable for security
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:daksh7743@localhost:5432/fra_atlas_db")
engine = create_engine(DATABASE_URL, echo=False)  # Set to True for SQL debugging
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Claim(Base):
    """
    Enhanced FRA Claims Model for Aṭavī Atlas
    Stores complete forest rights claims with OCR processing and geospatial data
    """
    __tablename__ = "claims"

    # Primary identifiers
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic claim information
    claimant_name = Column(String(255), nullable=False, index=True)
    village_name = Column(String(100))
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(50), default="Odisha", index=True)
    
    # Form information
    form_type = Column(String(100), nullable=False, index=True)  # IFR, CR, CFR
    form_subtype = Column(String(50))  # Individual, Community, etc.
    
    # Status and workflow tracking
    status = Column(String(50), default="Pending", index=True)
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    submission_date = Column(DateTime, default=func.now())
    
    # Verification and assignment
    is_verified = Column(Boolean, default=False)
    verification_notes = Column(Text)
    assigned_officer = Column(String(255))
    
    # Comments and processing notes
    comments = Column(Text)
    
    # Document storage
    document_filename = Column(String(255))
    
    # OCR processing results
    ocr_metadata = Column(JSON)  # Store complete OCR processing info
    extracted_fields = Column(JSON)  # Structured extracted data from forms
    
    # Geospatial data
    latitude = Column(Float)
    longitude = Column(Float)

    def to_dict(self, include_full_data=False):
        """
        Convert claim to dictionary with optional full data inclusion
        
        Args:
            include_full_data (bool): If True, includes OCR data, extracted fields, and metadata
        
        Returns:
            Dict containing claim data
        """
        basic_data = {
            "id": self.id,
            "claimant_name": self.claimant_name,
            "village_name": self.village_name,
            "district": self.district,
            "state": self.state,
            "form_type": self.form_type,
            "form_subtype": self.form_subtype,
            "status": self.status,
            "priority": self.priority,
            "submission_date": self.submission_date.isoformat() if self.submission_date else None,
            "comments": self.comments,
            "document_filename": self.document_filename,
            "is_verified": self.is_verified,
            "assigned_officer": self.assigned_officer,
            "verification_notes": self.verification_notes
        }
        
        if include_full_data:
            # Add complete extracted information
            extracted_data = self.extracted_fields or {}
            ocr_data = self.ocr_metadata or {}
            
            basic_data.update({
                # OCR extracted fields
                "extracted_fields": extracted_data,
                "ocr_metadata": ocr_data,
                
                # Geographic information
                "coordinates": {
                    "latitude": self.latitude,
                    "longitude": self.longitude
                },
                
                # Additional extracted details
                "full_address": extracted_data.get("Address"),
                "gram_panchayat": extracted_data.get("GramPanchayat"),
                "tehsil": extracted_data.get("Tehsil"),
                "full_name": extracted_data.get("FullName"),
                "holder_names": extracted_data.get("HolderNames"),
                
                # OCR processing information
                "processing_info": {
                    "atlas_version": ocr_data.get("atlas_version"),
                    "form_detection": ocr_data.get("form_subtype"),
                    "ocr_confidence": ocr_data.get("confidence"),
                    "raw_text_length": len(ocr_data.get("raw_text", ""))
                }
            })
        
        return basic_data

    def __repr__(self):
        return f"<Claim(id={self.id}, claimant='{self.claimant_name}', district='{self.district}', status='{self.status}')>"


class ClaimsService:
    """
    Complete Claims Management Service for Aṭavī Atlas
    Handles all CRUD operations and business logic for FRA claims
    """
    
    def __init__(self):
        self.db = SessionLocal()
    
    # ===== CREATE OPERATIONS =====
    
    def create_claim_from_ocr(self, ocr_result: Dict[str, Any], filename: str) -> Dict[str, Any]:
        """
        Create a new claim from OCR processing results
        
        Args:
            ocr_result: Complete OCR processing result from Atlas pipeline
            filename: Original document filename
            
        Returns:
            Dict with success status and claim ID
        """
        try:
            if not ocr_result.get("success"):
                raise ValueError("OCR processing failed - cannot create claim")
            
            atlas_data = ocr_result.get("atlas_claim_data", {})
            ocr_metadata = ocr_result.get("ocr_metadata", {})
            
            # Create new claim with all available data
            new_claim = Claim(
                claimant_name=atlas_data.get("claimant_name", "Unknown Claimant"),
                village_name=atlas_data.get("village_name"),
                district=atlas_data.get("district", "Unknown District"),
                state=atlas_data.get("state", "Odisha"),
                form_type=atlas_data.get("form_type", "Unknown Form Type"),
                form_subtype=atlas_data.get("form_subtype"),
                status="OCR Processed",
                priority="Medium",
                comments=atlas_data.get("comments", ""),
                document_filename=filename,
                ocr_metadata=ocr_metadata,
                extracted_fields=atlas_data.get("extracted_data", {}),
                is_verified=False
            )
            
            self.db.add(new_claim)
            self.db.commit()
            self.db.refresh(new_claim)
            
            print(f"✅ Claim created successfully: ID {new_claim.id}")
            return {
                "success": True,
                "claim_id": new_claim.id,
                "message": "Claim saved to database successfully",
                "claimant_name": new_claim.claimant_name,
                "district": new_claim.district
            }
            
        except Exception as e:
            self.db.rollback()
            print(f"❌ Error creating claim: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to save claim to database"
            }
    
    def create_manual_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a claim manually (without OCR processing)"""
        try:
            new_claim = Claim(
                claimant_name=claim_data.get("claimant_name", "Unknown"),
                village_name=claim_data.get("village_name"),
                district=claim_data.get("district", "Unknown"),
                state=claim_data.get("state", "Odisha"),
                form_type=claim_data.get("form_type", "Manual Entry"),
                form_subtype=claim_data.get("form_subtype"),
                status=claim_data.get("status", "Manual Entry"),
                priority=claim_data.get("priority", "Medium"),
                comments=claim_data.get("comments", ""),
                assigned_officer=claim_data.get("assigned_officer"),
                latitude=claim_data.get("latitude"),
                longitude=claim_data.get("longitude")
            )
            
            self.db.add(new_claim)
            self.db.commit()
            self.db.refresh(new_claim)
            
            return {
                "success": True,
                "claim_id": new_claim.id,
                "message": "Manual claim created successfully"
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
    
    # ===== READ OPERATIONS =====
    
    def get_all_claims(self, skip: int = 0, limit: int = 100, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """
        Get all claims with pagination and optional full data
        
        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            include_full_data: Whether to include OCR and extracted data
            
        Returns:
            List of claim dictionaries
        """
        try:
            claims = self.db.query(Claim).order_by(desc(Claim.submission_date)).offset(skip).limit(limit).all()
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Error fetching claims: {str(e)}")
            return []
    
    def get_claim_by_id(self, claim_id: int, include_full_data: bool = True) -> Optional[Dict[str, Any]]:
        """
        Get a specific claim by ID with full data by default
        
        Args:
            claim_id: Claim database ID
            include_full_data: Whether to include complete claim information
            
        Returns:
            Claim dictionary or None if not found
        """
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            return claim.to_dict(include_full_data=include_full_data) if claim else None
        except Exception as e:
            print(f"❌ Error fetching claim {claim_id}: {str(e)}")
            return None
    
    def get_claims_by_status(self, status: str, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """Get all claims with a specific status"""
        try:
            claims = self.db.query(Claim).filter(Claim.status == status).order_by(desc(Claim.submission_date)).all()
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Error fetching claims by status '{status}': {str(e)}")
            return []
    
    def get_claims_by_district(self, district: str, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """Get all claims from a specific district"""
        try:
            claims = self.db.query(Claim).filter(Claim.district.ilike(f"%{district}%")).order_by(desc(Claim.submission_date)).all()
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Error fetching claims by district '{district}': {str(e)}")
            return []
    
    def search_claims(self, query: str, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """
        Search claims by claimant name, district, village, or document filename
        
        Args:
            query: Search term
            include_full_data: Whether to include complete data
            
        Returns:
            List of matching claims
        """
        try:
            claims = self.db.query(Claim).filter(
                or_(
                    Claim.claimant_name.ilike(f"%{query}%"),
                    Claim.district.ilike(f"%{query}%"),
                    Claim.village_name.ilike(f"%{query}%"),
                    Claim.document_filename.ilike(f"%{query}%"),
                    Claim.form_type.ilike(f"%{query}%")
                )
            ).order_by(desc(Claim.submission_date)).all()
            
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Error searching claims with query '{query}': {str(e)}")
            return []
    
    # ===== UPDATE OPERATIONS =====
    
    def update_claim_status(self, claim_id: int, status: str, notes: str = "") -> Dict[str, Any]:
        """Update claim status with optional notes"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            old_status = claim.status
            claim.status = status
            
            if notes:
                current_notes = claim.verification_notes or ""
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                new_note = f"\n[{timestamp}] Status changed from '{old_status}' to '{status}': {notes}"
                claim.verification_notes = current_notes + new_note
            
            self.db.commit()
            return {
                "success": True,
                "message": f"Claim {claim_id} status updated from '{old_status}' to '{status}'"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def update_claim(self, claim_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update multiple claim fields
        
        Args:
            claim_id: Claim database ID
            updates: Dictionary of field names and new values
            
        Returns:
            Success/failure result
        """
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            # Update allowed fields
            allowed_fields = [
                'claimant_name', 'village_name', 'district', 'form_type', 'form_subtype',
                'status', 'priority', 'comments', 'assigned_officer', 'is_verified',
                'verification_notes', 'latitude', 'longitude'
            ]
            
            updated_fields = []
            for field, value in updates.items():
                if field in allowed_fields and hasattr(claim, field):
                    old_value = getattr(claim, field)
                    setattr(claim, field, value)
                    updated_fields.append(f"{field}: '{old_value}' → '{value}'")
            
            if updated_fields:
                self.db.commit()
                return {
                    "success": True,
                    "message": f"Claim {claim_id} updated successfully",
                    "updated_fields": updated_fields
                }
            else:
                return {
                    "success": False,
                    "error": "No valid fields provided for update"
                }
                
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def assign_claim_to_officer(self, claim_id: int, officer_name: str) -> Dict[str, Any]:
        """Assign claim to a specific officer"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            old_officer = claim.assigned_officer
            claim.assigned_officer = officer_name
            claim.status = "Under Review"
            
            # Add assignment note
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            assignment_note = f"\n[{timestamp}] Assigned to officer: {officer_name}"
            if old_officer:
                assignment_note += f" (previously assigned to: {old_officer})"
            
            claim.verification_notes = (claim.verification_notes or "") + assignment_note
            
            self.db.commit()
            return {
                "success": True,
                "message": f"Claim {claim_id} assigned to {officer_name}"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    # ===== DELETE OPERATIONS =====
    
    def delete_claim(self, claim_id: int) -> Dict[str, Any]:
        """
        Delete a claim (use with caution)
        
        Args:
            claim_id: Claim database ID
            
        Returns:
            Success/failure result
        """
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            claimant_name = claim.claimant_name
            district = claim.district
            
            self.db.delete(claim)
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Claim {claim_id} ({claimant_name} from {district}) deleted successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    # ===== ANALYTICS AND REPORTING =====
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics"""
        try:
            total_claims = self.db.query(Claim).count()
            pending_claims = self.db.query(Claim).filter(Claim.status == "Pending").count()
            processed_claims = self.db.query(Claim).filter(Claim.status == "OCR Processed").count()
            approved_claims = self.db.query(Claim).filter(Claim.status == "Approved").count()
            under_review = self.db.query(Claim).filter(Claim.status == "Under Review").count()
            
            # Recent activity (last 7 days)
            week_ago = datetime.now() - timedelta(days=7)
            recent_claims = self.db.query(Claim).filter(Claim.submission_date >= week_ago).count()
            
            # Claims by district (top 10)
            district_stats = self.db.query(
                Claim.district, 
                func.count(Claim.id).label('count')
            ).group_by(Claim.district).order_by(desc('count')).limit(10).all()
            
            # Claims by form type
            form_type_stats = self.db.query(
                Claim.form_subtype,
                func.count(Claim.id).label('count')
            ).group_by(Claim.form_subtype).order_by(desc('count')).all()
            
            # Priority distribution
            priority_stats = self.db.query(
                Claim.priority,
                func.count(Claim.id).label('count')
            ).group_by(Claim.priority).all()
            
            # Verification status
            verified_claims = self.db.query(Claim).filter(Claim.is_verified == True).count()
            unverified_claims = self.db.query(Claim).filter(Claim.is_verified == False).count()
            
            return {
                "total_claims": total_claims,
                "status_breakdown": {
                    "pending": pending_claims,
                    "processed": processed_claims,
                    "under_review": under_review,
                    "approved": approved_claims
                },
                "verification_status": {
                    "verified": verified_claims,
                    "unverified": unverified_claims
                },
                "recent_activity": {
                    "claims_last_7_days": recent_claims
                },
                "districts": [{"district": d.district, "count": d.count} for d in district_stats],
                "form_types": [{"type": f.form_subtype, "count": f.count} for f in form_type_stats if f.form_subtype],
                "priorities": [{"priority": p.priority, "count": p.count} for p in priority_stats]
            }
        except Exception as e:
            print(f"❌ Error fetching dashboard stats: {str(e)}")
            return {}
    
    def get_claims_summary(self) -> Dict[str, Any]:
        """Get a quick summary of claims system status"""
        try:
            stats = self.get_dashboard_stats()
            recent_claim = self.db.query(Claim).order_by(desc(Claim.submission_date)).first()
            
            return {
                "system_status": "Operational",
                "total_claims": stats.get("total_claims", 0),
                "latest_claim": {
                    "id": recent_claim.id if recent_claim else None,
                    "claimant_name": recent_claim.claimant_name if recent_claim else None,
                    "district": recent_claim.district if recent_claim else None,
                    "submission_date": recent_claim.submission_date.isoformat() if recent_claim and recent_claim.submission_date else None
                },
                "atlas_version": "1.0.0",
                "pilot_state": "Odisha"
            }
        except Exception as e:
            print(f"❌ Error fetching claims summary: {str(e)}")
            return {"system_status": "Error", "error": str(e)}
    
    def close(self):
        """Close database connection"""
        self.db.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Global service instance
claims_service = ClaimsService()

# Utility function for testing
def test_connection():
    """Test database connection"""
    try:
        connection = engine.connect()
        connection.close()
        return True
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("🌳 Aṭavī Atlas Claims Service")
    print("Testing database connection...")
    
    if test_connection():
        print("✅ Database connection successful")
        
        # Test basic operations
        with ClaimsService() as service:
            stats = service.get_dashboard_stats()
            print(f"📊 Total claims in database: {stats.get('total_claims', 0)}")
            
            summary = service.get_claims_summary()
            print(f"🎯 System status: {summary.get('system_status')}")
    else:
        print("❌ Database connection failed")
