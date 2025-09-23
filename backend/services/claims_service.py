"""
Aṭavī Atlas - Claims Service (Simplified - No PostGIS)
Complete FRA Claims Management with PostgreSQL only

Features:
- Complete CRUD operations for FRA claims
- WebGIS output management in PostgreSQL
- Dashboard analytics and reporting
- Search and filtering capabilities
- No PostGIS dependency

Version: 1.0.0
Pilot State: Odisha
"""

from sqlalchemy import create_engine, desc, func, and_, or_, Column, Integer, String, DateTime, Text, Float, JSON, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:daksh7743@localhost:5432/fra_atlas_db")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============= DATABASE MODELS =============

class Claim(Base):
    """
    FRA Claims Model - Simplified (No PostGIS)
    
    Stores:
    - Basic claim information (PostgreSQL)
    - OCR extracted data (PostgreSQL JSON)
    - No spatial geometry columns
    """
    __tablename__ = "claims"

    # Primary key and basic info
    id = Column(Integer, primary_key=True, index=True)
    claimant_name = Column(String(255), nullable=False, index=True)
    village_name = Column(String(100))
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(50), default="Odisha", index=True)
    
    # Form information
    form_type = Column(String(100), nullable=False, index=True)
    form_subtype = Column(String(50))
    
    # Claim status and processing
    status = Column(String(50), default="Pending", index=True)
    priority = Column(String(20), default="Medium")
    submission_date = Column(DateTime, default=func.now())
    
    # Verification and assignment
    is_verified = Column(Boolean, default=False)
    verification_notes = Column(Text)
    assigned_officer = Column(String(255))
    
    # Additional information
    comments = Column(Text)
    document_filename = Column(String(255))
    
    # OCR and extracted data (PostgreSQL JSON)
    ocr_metadata = Column(JSON)
    extracted_fields = Column(JSON)
    
    # Basic coordinates (for backward compatibility)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # ✅ Relationships to WebGIS OUTPUT tables
    gis_assets = relationship("GISAsset", back_populates="claim", cascade="all, delete-orphan")
    gis_analytics = relationship("GISAnalytics", back_populates="claim", cascade="all, delete-orphan")

    def to_dict(self, include_full_data=False):
        """Enhanced to_dict with WebGIS integration (no PostGIS)"""
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
            extracted_data = self.extracted_fields or {}
            ocr_data = self.ocr_metadata or {}
            
            basic_data.update({
                "extracted_fields": extracted_data,
                "ocr_metadata": ocr_data,
                "coordinates": {
                    "latitude": self.latitude,
                    "longitude": self.longitude
                },
                "full_address": extracted_data.get("Address"),
                "gram_panchayat": extracted_data.get("GramPanchayat"),
                "tehsil": extracted_data.get("Tehsil"),
                "full_name": extracted_data.get("FullName"),
                "holder_names": extracted_data.get("HolderNames"),
                
                # ✅ GIS ANALYSIS STATUS (PostgreSQL only)
                "gis_analysis": {
                    "has_analysis": len(self.gis_assets) > 0,
                    "assets_count": len(self.gis_assets),
                    "analytics_count": len(self.gis_analytics)
                },
                
                "processing_info": {
                    "atlas_version": ocr_data.get("atlas_version", "1.0.0"),
                    "form_detection": ocr_data.get("form_subtype"),
                    "ocr_confidence": ocr_data.get("confidence"),
                    "raw_text_length": len(ocr_data.get("raw_text", ""))
                }
            })
        
        return basic_data

class GISAsset(Base):
    """
    ✅ PostgreSQL table for WebGIS OUTPUT storage
    
    Stores satellite imagery, classification maps, and analysis results
    """
    __tablename__ = "gis_assets"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey('claims.id'), nullable=False, index=True)
    
    # Asset metadata
    asset_type = Column(String(50), nullable=False)  # 'satellite_analysis', 'classification_map'
    asset_name = Column(String(255), nullable=False)
    asset_description = Column(Text)
    
    # ✅ WebGIS service outputs (PostgreSQL JSON)
    satellite_image_url = Column(Text)
    land_classification_results = Column(JSON)
    processing_metadata = Column(JSON)
    
    # Processing information
    created_date = Column(DateTime, default=func.now())
    satellite_data_source = Column(String(100))
    processing_date_range = Column(String(100))
    gee_project_id = Column(String(100))
    
    # Relationships
    claim = relationship("Claim", back_populates="gis_assets")
    analytics = relationship("GISAnalytics", back_populates="asset", cascade="all, delete-orphan")

class GISAnalytics(Base):
    """
    ✅ PostgreSQL table for detailed analytics OUTPUT
    
    Stores detailed land classification analytics per claim
    """
    __tablename__ = "gis_analytics"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey('claims.id'), nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey('gis_assets.id'), nullable=False, index=True)
    
    # ✅ Analytics data (PostgreSQL columns)
    land_class_name = Column(String(100), nullable=False, index=True)
    area_hectares = Column(Float, nullable=False)
    percentage_of_total = Column(Float, nullable=False)
    confidence_score = Column(Float)
    
    # Processing metadata
    analysis_date = Column(DateTime, default=func.now())
    model_version = Column(String(50))
    
    # Relationships
    claim = relationship("Claim", back_populates="gis_analytics")
    asset = relationship("GISAsset", back_populates="analytics")

# ============= CLAIMS SERVICE CLASS =============

class ClaimsService:
    """
    Complete Claims Management Service for Aṭavī Atlas
    
    Features:
    - CRUD operations for claims
    - WebGIS integration (output storage)
    - Search and analytics
    - Dashboard statistics
    - No PostGIS dependency
    """
    
    def __init__(self):
        """Initialize database session"""
        self.db = SessionLocal()
        print("✅ Claims service initialized (PostgreSQL only)")
    
    def close(self):
        """Close database session"""
        self.db.close()
    
    # ============= BASIC CRUD OPERATIONS =============
    
    def get_all_claims(self, skip: int = 0, limit: int = 100, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """Get all claims with pagination"""
        try:
            claims = (
                self.db.query(Claim)
                .order_by(desc(Claim.submission_date))
                .offset(skip)
                .limit(limit)
                .all()
            )
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Error fetching claims: {e}")
            return []
    
    def get_claim_by_id(self, claim_id: int, include_full_data: bool = True) -> Optional[Dict[str, Any]]:
        """Get specific claim by ID"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            return claim.to_dict(include_full_data=include_full_data) if claim else None
        except Exception as e:
            print(f"❌ Error fetching claim {claim_id}: {e}")
            return None
    
    def create_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new claim with OCR data"""
        try:
            new_claim = Claim(
                claimant_name=claim_data.get("claimant_name", "Unknown"),
                village_name=claim_data.get("village_name"),
                district=claim_data.get("district", "Unknown"),
                state=claim_data.get("state", "Odisha"),
                form_type=claim_data.get("form_type", "Unknown"),
                form_subtype=claim_data.get("form_subtype"),
                status=claim_data.get("status", "OCR Processed"),
                priority=claim_data.get("priority", "Medium"),
                comments=claim_data.get("comments", ""),
                document_filename=claim_data.get("document_filename"),
                ocr_metadata=claim_data.get("ocr_metadata", {}),
                extracted_fields=claim_data.get("extracted_fields", {}),
                latitude=claim_data.get("latitude"),
                longitude=claim_data.get("longitude")
            )
            
            self.db.add(new_claim)
            self.db.commit()
            self.db.refresh(new_claim)
            
            return {
                "success": True,
                "claim_id": new_claim.id,
                "message": f"Claim created for {new_claim.claimant_name}"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    # ✅ FIXED OCR METHOD - Cross-verified with your OCR service
    def create_claim_from_ocr(self, ocr_data: Dict[str, Any], document_filename: str = None) -> Dict[str, Any]:
        """Create claim from OCR processing results"""
        try:
            # ✅ DEBUG: See what OCR data we're actually getting
            print("🔍 ===== OCR DEBUG START =====")
            print(f"🔍 OCR DATA RECEIVED: {json.dumps(ocr_data, indent=2)}")
            print(f"🔍 DOCUMENT FILENAME: {document_filename}")
            print("🔍 ===== OCR DEBUG END =====")
            
            # ✅ Handle your OCR service's specific data structure
            if "atlas_claim_data" in ocr_data and "ocr_metadata" in ocr_data:
                # Your OCR service returns: {atlas_claim_data: {...}, ocr_metadata: {...}}
                atlas_claim = ocr_data["atlas_claim_data"]
                ocr_metadata = ocr_data["ocr_metadata"]
                extracted_fields = ocr_metadata.get("extracted_fields", {})
            else:
                # Fallback for other formats
                atlas_claim = ocr_data
                ocr_metadata = {}
                extracted_fields = ocr_data.get("extracted_data", {}) or ocr_data.get("extracted_fields", {})
            
            print(f"🔍 ATLAS CLAIM DATA: {json.dumps(atlas_claim, indent=2)}")
            print(f"🔍 OCR METADATA: {json.dumps(ocr_metadata, indent=2)}")
            print(f"🔍 EXTRACTED FIELDS: {json.dumps(extracted_fields, indent=2)}")
            
            # ✅ Extract data based on your OCR service structure
            claimant_name = (
                atlas_claim.get("claimant_name") or
                extracted_fields.get("FullName") or 
                extracted_fields.get("HolderNames") or 
                extracted_fields.get("Name") or 
                "Unknown"
            )
            
            village_name = (
                extracted_fields.get("Village") or 
                extracted_fields.get("VillageOrGramSabha") or
                extracted_fields.get("village") or
                None
            )
            
            district = (
                atlas_claim.get("district") or
                extracted_fields.get("District") or 
                "Unknown"
            )
            
            state = (
                atlas_claim.get("state") or
                extracted_fields.get("State") or 
                "Odisha"
            )
            
            form_type = (
                atlas_claim.get("form_type") or
                ocr_metadata.get("form_type") or 
                extracted_fields.get("FormHeading") or
                "FRA Form"
            )
            
            form_subtype = (
                atlas_claim.get("form_subtype") or
                ocr_metadata.get("form_subtype") or 
                extracted_fields.get("FormSubtype") or
                "IFR"
            )
            
            # Use comments from atlas_claim or create new
            comments = (
                atlas_claim.get("comments") or
                f"Processed via Aṭavī Atlas OCR pipeline on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            )
            
            print(f"🔍 FINAL EXTRACTED VALUES:")
            print(f"  Claimant Name: '{claimant_name}'")
            print(f"  Village: '{village_name}'") 
            print(f"  District: '{district}'")
            print(f"  State: '{state}'")
            print(f"  Form Type: '{form_type}'")
            print(f"  Form Subtype: '{form_subtype}'")
            
            # Create claim data structure
            claim_data = {
                "claimant_name": claimant_name,
                "village_name": village_name,
                "district": district,
                "state": state,
                "form_type": form_type,
                "form_subtype": form_subtype,
                "status": "OCR Processed",
                "priority": "Medium",
                "comments": comments,
                "document_filename": document_filename,
                "ocr_metadata": {
                    "atlas_version": ocr_metadata.get("atlas_version", "1.0.0"),
                    "processing_date": datetime.now().isoformat(),
                    "confidence": ocr_metadata.get("confidence", 0.0),
                    "form_type": form_type,
                    "form_subtype": form_subtype,
                    "raw_text": ocr_metadata.get("raw_text", ""),
                    "processing_time": ocr_metadata.get("processing_time", 0),
                    "processing_timestamp": ocr_metadata.get("processing_timestamp"),
                    "pilot_state": ocr_metadata.get("pilot_state", "Odisha")
                },
                "extracted_fields": extracted_fields,
                # Extract coordinates if available
                "latitude": self._extract_coordinate(extracted_fields, "latitude"),
                "longitude": self._extract_coordinate(extracted_fields, "longitude")
            }
            
            print(f"🔍 CLAIM DATA TO CREATE: {json.dumps(claim_data, indent=2, default=str)}")
            
            # Create the claim
            result = self.create_claim(claim_data)
            
            if result["success"]:
                print(f"✅ SUCCESS: Claim {result['claim_id']} created for '{claimant_name}'")
                return {
                    "success": True,
                    "claim_id": result["claim_id"],
                    "message": f"Claim created from OCR: {claimant_name}",
                    "ocr_confidence": ocr_metadata.get("confidence", 0.0),
                    "form_detected": form_subtype
                }
            else:
                print(f"❌ FAILED to create claim: {result}")
                return result
                
        except Exception as e:
            print(f"❌ Error creating claim from OCR: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": f"Failed to create claim from OCR: {str(e)}"
            }

    def _extract_coordinate(self, extracted_fields: dict, coord_type: str) -> float:
        """Helper to extract coordinates from various field formats"""
        try:
            # Try different possible field names
            coord_fields = {
                "latitude": ["Latitude", "latitude", "lat", "Lat"],
                "longitude": ["Longitude", "longitude", "lng", "Lng", "long", "Long"]
            }
            
            for field_name in coord_fields.get(coord_type, []):
                if field_name in extracted_fields:
                    coord_value = extracted_fields[field_name]
                    if isinstance(coord_value, (int, float)):
                        return float(coord_value)
                    elif isinstance(coord_value, str):
                        # Try to parse coordinate string
                        import re
                        numbers = re.findall(r'[\d.]+', coord_value)
                        if numbers:
                            return float(numbers[0])
            
            return None
        except:
            return None
    
    def create_manual_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create manual claim for testing"""
        return self.create_claim(claim_data)
    
    def update_claim_status(self, claim_id: int, new_status: str, notes: str = "") -> Dict[str, Any]:
        """Update claim status"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            old_status = claim.status
            claim.status = new_status
            claim.verification_notes = notes
            
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Claim {claim_id} status updated from '{old_status}' to '{new_status}'"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def update_claim(self, claim_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update multiple claim fields"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            for field, value in updates.items():
                if hasattr(claim, field):
                    setattr(claim, field, value)
            
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Claim {claim_id} updated successfully",
                "updated_fields": list(updates.keys())
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def delete_claim(self, claim_id: int) -> Dict[str, Any]:
        """Delete claim and all associated data"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            claimant_name = claim.claimant_name
            
            # Delete claim (cascade will handle GIS assets and analytics)
            self.db.delete(claim)
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Claim {claim_id} for {claimant_name} deleted successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def assign_claim_to_officer(self, claim_id: int, officer_name: str) -> Dict[str, Any]:
        """Assign claim to officer"""
        try:
            claim = self.db.query(Claim).filter(Claim.id == claim_id).first()
            if not claim:
                return {"success": False, "error": "Claim not found"}
            
            claim.assigned_officer = officer_name
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Claim {claim_id} assigned to {officer_name}"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    # ============= SEARCH AND FILTERING =============
    
    def search_claims(self, query: str, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """Search claims by name, district, village, or filename"""
        try:
            claims = (
                self.db.query(Claim)
                .filter(
                    or_(
                        Claim.claimant_name.ilike(f"%{query}%"),
                        Claim.district.ilike(f"%{query}%"),
                        Claim.village_name.ilike(f"%{query}%"),
                        Claim.document_filename.ilike(f"%{query}%")
                    )
                )
                .order_by(desc(Claim.submission_date))
                .all()
            )
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Search error: {e}")
            return []
    
    def get_claims_by_status(self, status: str, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """Get claims by status"""
        try:
            claims = (
                self.db.query(Claim)
                .filter(Claim.status == status)
                .order_by(desc(Claim.submission_date))
                .all()
            )
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Error filtering by status: {e}")
            return []
    
    def get_claims_by_district(self, district: str, include_full_data: bool = False) -> List[Dict[str, Any]]:
        """Get claims by district"""
        try:
            claims = (
                self.db.query(Claim)
                .filter(Claim.district.ilike(f"%{district}%"))
                .order_by(desc(Claim.submission_date))
                .all()
            )
            return [claim.to_dict(include_full_data=include_full_data) for claim in claims]
        except Exception as e:
            print(f"❌ Error filtering by district: {e}")
            return []
    
    # ============= DASHBOARD AND ANALYTICS =============
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics"""
        try:
            # Basic counts
            total_claims = self.db.query(Claim).count()
            
            # Status breakdown
            status_stats = (
                self.db.query(Claim.status, func.count(Claim.id))
                .group_by(Claim.status)
                .all()
            )
            
            # District breakdown
            district_stats = (
                self.db.query(Claim.district, func.count(Claim.id))
                .group_by(Claim.district)
                .all()
            )
            
            # Form type breakdown
            form_stats = (
                self.db.query(Claim.form_subtype, func.count(Claim.id))
                .group_by(Claim.form_subtype)
                .all()
            )
            
            # Priority breakdown
            priority_stats = (
                self.db.query(Claim.priority, func.count(Claim.id))
                .group_by(Claim.priority)
                .all()
            )
            
            # Recent activity (last 7 days)
            seven_days_ago = datetime.now() - timedelta(days=7)
            recent_claims = (
                self.db.query(Claim)
                .filter(Claim.submission_date >= seven_days_ago)
                .count()
            )
            
            # Verification status
            verified_claims = self.db.query(Claim).filter(Claim.is_verified == True).count()
            unverified_claims = total_claims - verified_claims
            
            # GIS analysis coverage
            gis_analyzed_claims = (
                self.db.query(Claim)
                .join(GISAsset, Claim.id == GISAsset.claim_id, isouter=True)
                .filter(GISAsset.id.isnot(None))
                .distinct(Claim.id)
                .count()
            )
            
            return {
                "total_claims": total_claims,
                "status_breakdown": {
                    "pending": sum(count for status, count in status_stats if status == "Pending"),
                    "processed": sum(count for status, count in status_stats if "Processed" in status),
                    "under_review": sum(count for status, count in status_stats if "Review" in status),
                    "approved": sum(count for status, count in status_stats if status == "Approved")
                },
                "verification_status": {
                    "verified": verified_claims,
                    "unverified": unverified_claims
                },
                "recent_activity": {
                    "claims_last_7_days": recent_claims
                },
                "districts": [{"district": district, "count": count} for district, count in district_stats],
                "form_types": [{"type": form_type or "Unknown", "count": count} for form_type, count in form_stats],
                "priorities": [{"priority": priority, "count": count} for priority, count in priority_stats],
                "gis_analysis": {
                    "analyzed_claims": gis_analyzed_claims,
                    "coverage_percent": round((gis_analyzed_claims / total_claims * 100) if total_claims > 0 else 0, 2)
                }
            }
        except Exception as e:
            print(f"❌ Dashboard stats error: {e}")
            return {"error": str(e)}
    
    def get_claims_summary(self) -> Dict[str, Any]:
        """Get quick claims summary"""
        try:
            total = self.db.query(Claim).count()
            pending = self.db.query(Claim).filter(Claim.status == "Pending").count()
            processed = self.db.query(Claim).filter(Claim.status.like("%Processed%")).count()
            
            return {
                "total_claims": total,
                "pending_claims": pending,
                "processed_claims": processed,
                "completion_rate": round((processed / total * 100) if total > 0 else 0, 2)
            }
        except Exception as e:
            return {"error": str(e)}
    
    # ============= WEBGIS INTEGRATION HELPERS =============
    
    def get_claims_with_gis_analysis(self) -> List[Dict[str, Any]]:
        """Get all claims that have GIS analysis"""
        try:
            claims = (
                self.db.query(Claim)
                .join(GISAsset, Claim.id == GISAsset.claim_id)
                .distinct(Claim.id)
                .order_by(desc(Claim.submission_date))
                .all()
            )
            return [claim.to_dict(include_full_data=True) for claim in claims]
        except Exception as e:
            print(f"❌ Error fetching GIS claims: {e}")
            return []
    
    def get_gis_analytics_summary(self) -> Dict[str, Any]:
        """Get summary of GIS analytics across all claims"""
        try:
            total_analyzed_area = (
                self.db.query(func.sum(GISAnalytics.area_hectares))
                .scalar() or 0
            )
            
            forest_area = (
                self.db.query(func.sum(GISAnalytics.area_hectares))
                .filter(GISAnalytics.land_class_name.like("%Forest%"))
                .scalar() or 0
            )
            
            land_class_breakdown = (
                self.db.query(
                    GISAnalytics.land_class_name, 
                    func.sum(GISAnalytics.area_hectares).label('total_area')
                )
                .group_by(GISAnalytics.land_class_name)
                .all()
            )
            
            return {
                "total_analyzed_area_hectares": round(total_analyzed_area, 2),
                "total_forest_area_hectares": round(forest_area, 2),
                "forest_coverage_percent": round((forest_area / total_analyzed_area * 100) if total_analyzed_area > 0 else 0, 2),
                "land_class_breakdown": [
                    {
                        "land_class": land_class,
                        "area_hectares": round(area, 2),
                        "percentage": round((area / total_analyzed_area * 100) if total_analyzed_area > 0 else 0, 2)
                    }
                    for land_class, area in land_class_breakdown
                ]
            }
        except Exception as e:
            print(f"❌ GIS analytics summary error: {e}")
            return {"error": str(e)}

# ============= GLOBAL SERVICE INSTANCE =============

# Create global claims service instance
claims_service = ClaimsService()

# Create tables if they don't exist
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
except Exception as e:
    print(f"⚠️ Database table creation warning: {e}")

print("✅ Claims service ready (PostgreSQL only - no PostGIS)")
