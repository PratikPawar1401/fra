from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

# Import route modules (we'll create these step by step)
# from routes import claims, documents, maps, auth
# from config.database import engine
# from models import Base

# AI Pipeline integration
try:
    from services.ai_pipeline import ai_pipeline
    AI_PIPELINE_AVAILABLE = True
except ImportError:
    AI_PIPELINE_AVAILABLE = False
    print("⚠️  AI Pipeline not available - install dependencies or check ai-pipeline setup")

# ✅ Claims service integration
try:
    from services.claims_service import claims_service
    CLAIMS_SERVICE_AVAILABLE = True
    print("✅ Claims service loaded successfully")
except ImportError:
    CLAIMS_SERVICE_AVAILABLE = False
    print("⚠️  Claims service not available - check database setup")

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🌳 Starting Aṭavī Atlas - FRA Decision Support System...")
    print(f"🎯 Pilot State: Odisha")
    print(f"📡 AI Pipeline: {'✅ Available' if AI_PIPELINE_AVAILABLE else '❌ Unavailable'}")
    print(f"🗃️  Claims Service: {'✅ Available' if CLAIMS_SERVICE_AVAILABLE else '❌ Unavailable'}")
    print(f"📊 WebGIS: PostGIS Integration (Coming)")
    print("✅ Aṭavī Atlas API Gateway Online!")
    
    # Database table creation (when database is setup)
    # Base.metadata.create_all(bind=engine)
    yield
    
    # Shutdown
    print("🛑 Shutting down Aṭavī Atlas...")

app = FastAPI(
    title="🌳 Aṭavī Atlas - FRA Decision Support System",
    description="""
    **AI-powered Forest Rights Act Atlas and WebGIS-based Decision Support System**
    
    🎯 **Pilot Implementation: Odisha State**
    
    **Core Services:**
    - 📄 **Document Processing**: OCR + NER for FRA forms (IFR, CR, CFR)
    - 🗂️  **Claims Management**: Digital library for forest rights claims
    - 🛰️  **Asset Mapping**: Satellite imagery analysis with ML/CV
    - 🧠 **Decision Support**: AI-powered government scheme recommendations
    - 🗺️  **WebGIS**: Interactive mapping with PostGIS
    - 📊 **Analytics**: Real-time dashboard and reporting
    
    **Target States**: Odisha (Pilot), Madhya Pradesh, Tripura, Telangana
    
    **SIH 2025 - Team EdgeViz**
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
    contact={
        "name": "Team EdgeViz - SIH 2025",
        "email": "team@edgeviz.com",
    },
    license_info={
        "name": "SIH 2025 License",
        "url": "https://sih.gov.in/",
    }
)

# Enhanced CORS for multiple frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # React frontend
        "http://localhost:3001",    # Alternative React port  
        "http://localhost:8080",    # Vue frontend
        "http://localhost:5173",    # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "*"  # Configure properly for production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "service": "Aṭavī Atlas",
            "timestamp": datetime.now().isoformat()
        }
    )

# ============= MAIN ENDPOINTS =============

@app.get("/")
async def root():
    """Root endpoint - Aṭavī Atlas system information"""
    return {
        "message": "🌳 Aṭavī Atlas - Forest Rights Act Decision Support System",
        "version": "1.0.0",
        "pilot_state": "Odisha",
        "description": "AI-powered FRA monitoring and decision support for integrated forest rights implementation",
        "team": "EdgeViz - SIH 2025",
        "services": {
            "claims_management": "✅ Active" if CLAIMS_SERVICE_AVAILABLE else "❌ Unavailable",
            "document_ocr": "✅ Active" if AI_PIPELINE_AVAILABLE else "❌ Unavailable", 
            "webgis": "🔄 Coming",
            "asset_mapping": "🔄 Coming",
            "decision_support": "🔄 Coming",
            "analytics": "✅ Active" if CLAIMS_SERVICE_AVAILABLE else "🔄 Coming"
        },
        "documentation": "/api/docs",
        "endpoints": {
            "health": "/health",
            "api_info": "/api/v1",
            "ocr_service": "/api/v1/ocr/",
            "claims_service": "/api/v1/claims/",
            "dashboard": "/api/v1/dashboard/",
            "ai_pipeline": "/api/v1/ai-pipeline/"
        }
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check for all Aṭavī Atlas services"""
    return {
        "status": "healthy",
        "service": "Aṭavī Atlas API Gateway", 
        "version": "1.0.0",
        "pilot_state": "Odisha",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "api_gateway": "✅ healthy",
            "ai_pipeline": "✅ available" if AI_PIPELINE_AVAILABLE else "❌ unavailable",
            "claims_service": "✅ available" if CLAIMS_SERVICE_AVAILABLE else "❌ unavailable",
            "database": "✅ connected" if CLAIMS_SERVICE_AVAILABLE else "❌ disconnected",
            "webgis": "🔄 pending setup",
            "file_storage": "✅ local storage ready"
        },
        "uptime": "active",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# ============= API V1 ENDPOINTS =============

@app.get("/api/v1")
async def api_v1_info():
    """API v1 information and available services"""
    return {
        "api_version": "v1",
        "atlas_version": "1.0.0",
        "pilot_state": "Odisha",
        "focus": "Forest Rights Act Implementation & Monitoring",
        "sih_challenge": "SIH25108 - FRA Atlas and WebGIS-based DSS",
        "services_status": {
            "ocr_processing": "✅ Active" if AI_PIPELINE_AVAILABLE else "❌ Inactive",
            "claims_management": "✅ Active" if CLAIMS_SERVICE_AVAILABLE else "❌ Inactive",
            "webgis_operations": "🔄 Development", 
            "asset_mapping": "🔄 Development",
            "decision_support": "🔄 Development"
        },
        "available_endpoints": {
            "ocr_process": "/api/v1/ocr/process-document",
            "ocr_forms": "/api/v1/ocr/form-types", 
            "ai_status": "/api/v1/ai-pipeline/status",
            "claims": "/api/v1/claims",
            "dashboard": "/api/v1/dashboard/stats",
            "search": "/api/v1/claims/search"
        },
        "supported_features": {
            "claim_types": ["IFR", "CR", "CFR"] if AI_PIPELINE_AVAILABLE else [],
            "document_formats": ["PDF", "JPG", "PNG"],
            "states": ["Odisha (Pilot)", "Madhya Pradesh", "Tripura", "Telangana"],
            "languages": ["English", "Hindi", "Odia"]
        }
    }

# ============= AI PIPELINE & OCR ENDPOINTS =============

@app.get("/api/v1/ai-pipeline/status")
async def ai_pipeline_status():
    """Check AI Pipeline service status and capabilities"""
    if not AI_PIPELINE_AVAILABLE:
        return {
            "ai_pipeline_available": False,
            "error": "AI Pipeline service unavailable",
            "message": "Please check ai-pipeline setup and dependencies"
        }
    
    return ai_pipeline.health_check()

@app.get("/api/v1/ocr/form-types")
async def get_supported_form_types():
    """Get FRA form types supported by Aṭavī Atlas OCR"""
    if not AI_PIPELINE_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="AI Pipeline service unavailable. Please check ai-pipeline setup and dependencies."
        )
    
    try:
        form_types = ai_pipeline.get_form_types()
        return {
            "status": "success",
            "atlas_version": "1.0.0",
            "pilot_state": "Odisha",
            "supported_forms": form_types,
            "usage": {
                "endpoint": "/api/v1/ocr/process-document",
                "method": "POST",
                "parameters": {
                    "file": "FRA document (PDF/JPG/PNG)",
                    "form_type": "new_claim or legacy_claim"
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving form types: {str(e)}")

@app.post("/api/v1/ocr/process-document")
async def process_fra_document(
    file: UploadFile = File(..., description="FRA document (PDF/Image)"),
    form_type: str = Form(..., description="Form type: new_claim or legacy_claim")
):
    """
    🔥 **Process FRA Document through Aṭavī Atlas OCR Pipeline**
    
    **Extracts structured data from Forest Rights Act documents**
    
    - **Supported Forms**: IFR, CR, CFR (new_claim), Legacy titles (legacy_claim)
    - **File Types**: PDF, JPG, PNG
    - **Processing**: LLMWhisperer OCR + Custom field extraction
    - **Output**: Structured claim data ready for database insertion
    """
    if not AI_PIPELINE_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="AI Pipeline service unavailable. Please install dependencies and check ai-pipeline setup."
        )
    
    # Validate form type
    valid_forms = ["new_claim", "legacy_claim"]
    if form_type not in valid_forms:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid form_type '{form_type}'. Must be one of: {valid_forms}"
        )
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: PDF, JPEG, PNG"
        )
    
    # File size check (50MB limit)
    if file.size and file.size > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size: 50MB"
        )
    
    try:
        # Process through AI Pipeline
        result = await ai_pipeline.process_document(file, form_type)
        
        # Enhance result with Atlas metadata
        result["atlas_info"] = {
            "service": "Aṭavī Atlas OCR Processing",
            "version": "1.0.0",
            "pilot_state": "Odisha",
            "processing_endpoint": "/api/v1/ocr/process-document",
            "processed_at": datetime.now().isoformat(),
            "file_info": {
                "filename": file.filename,
                "content_type": file.content_type,
                "size_bytes": file.size
            }
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Document processing failed: {str(e)}"
        )

# ============= ✅ CLAIMS MANAGEMENT ENDPOINTS =============

@app.get("/api/v1/claims")
async def get_all_claims(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[str] = Query(None, description="Filter by status"),
    district: Optional[str] = Query(None, description="Filter by district"),
    full_details: bool = Query(False, description="Include complete OCR data")
):
    """Get all claims with optional filtering and pagination"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        if status:
            claims = claims_service.get_claims_by_status(status, include_full_data=full_details)
        elif district:
            claims = claims_service.get_claims_by_district(district, include_full_data=full_details)
        else:
            claims = claims_service.get_all_claims(skip, limit, include_full_data=full_details)
        
        return {
            "status": "success",
            "total_claims": len(claims),
            "claims": claims,
            "filters_applied": {
                "status": status,
                "district": district,
                "pagination": {"skip": skip, "limit": limit},
                "full_details": full_details
            },
            "atlas_version": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ SEARCH ENDPOINT MOVED BEFORE {claim_id} ROUTE
@app.get("/api/v1/claims/search")
async def search_claims(
    q: str = Query(..., min_length=2, description="Search query"),
    full_details: bool = Query(False, description="Include complete data")
):
    """Search claims by claimant name, district, village, or document filename"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        claims = claims_service.search_claims(q, include_full_data=full_details)
        return {
            "status": "success",
            "query": q,
            "results_count": len(claims),
            "claims": claims,
            "atlas_version": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/claims/{claim_id}")
async def get_claim_by_id(
    claim_id: int,
    full_details: bool = Query(True, description="Include complete claim data")
):
    """Get specific claim by ID with complete information"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        claim = claims_service.get_claim_by_id(claim_id, include_full_data=full_details)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        return {
            "status": "success",
            "claim": claim,
            "atlas_version": "1.0.0"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/claims/{claim_id}/full")
async def get_claim_full_details(claim_id: int):
    """Get complete claim information including all OCR data and metadata"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        claim = claims_service.get_claim_by_id(claim_id, include_full_data=True)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        return {
            "status": "success",
            "claim": claim,
            "atlas_info": {
                "service": "Aṭavī Atlas Claims Service",
                "version": "1.0.0",
                "pilot_state": "Odisha",
                "data_completeness": "Full OCR and extracted data included"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/claims/{claim_id}/status")
async def update_claim_status(
    claim_id: int,
    status: str = Query(..., description="New status (Pending, Under Review, Approved, Rejected)"),
    notes: Optional[str] = Query(None, description="Update notes")
):
    """Update claim status with optional notes"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        result = claims_service.update_claim_status(claim_id, status, notes or "")
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/claims/{claim_id}")
async def update_claim(claim_id: int, updates: dict):
    """Update multiple claim fields"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        result = claims_service.update_claim(claim_id, updates)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/claims/{claim_id}")
async def delete_claim(claim_id: int):
    """Delete a claim (use with caution)"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        result = claims_service.delete_claim(claim_id)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/claims/{claim_id}/assign")
async def assign_claim_to_officer(
    claim_id: int,
    officer_name: str = Query(..., description="Officer name to assign claim to")
):
    """Assign claim to a specific officer"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        result = claims_service.assign_claim_to_officer(claim_id, officer_name)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= ✅ DASHBOARD & ANALYTICS ENDPOINTS =============

@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics for Aṭavī Atlas"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        stats = claims_service.get_dashboard_stats()
        return {
            "status": "success",
            "pilot_state": "Odisha",
            "atlas_version": "1.0.0",
            "generated_at": datetime.now().isoformat(),
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/dashboard/recent-activity")
async def get_recent_activity():
    """Get recent claims activity"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        recent_claims = claims_service.get_all_claims(0, 10, include_full_data=False)  # Last 10 claims
        return {
            "status": "success",
            "recent_claims": recent_claims,
            "atlas_version": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/dashboard/summary")
async def get_system_summary():
    """Get a quick summary of Aṭavī Atlas system status"""
    if not CLAIMS_SERVICE_AVAILABLE:
        return {
            "status": "service_unavailable",
            "message": "Claims service not available - check database connection"
        }
    
    try:
        summary = claims_service.get_claims_summary()
        summary["services_status"] = {
            "ai_pipeline": "✅ Available" if AI_PIPELINE_AVAILABLE else "❌ Unavailable",
            "claims_service": "✅ Available" if CLAIMS_SERVICE_AVAILABLE else "❌ Unavailable",
            "database": "✅ Connected" if CLAIMS_SERVICE_AVAILABLE else "❌ Disconnected"
        }
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= SYSTEM ENDPOINTS =============

@app.get("/api/v1/system/info")
async def get_system_info():
    """Get complete system information for debugging and monitoring"""
    return {
        "system_name": "Aṭavī Atlas",
        "version": "1.0.0",
        "description": "Forest Rights Act Decision Support System",
        "pilot_state": "Odisha",
        "features": [
            "OCR Document Processing",
            "Claims Management", 
            "Dashboard Analytics",
            "Search & Filter",
            "Status Updates",
            "Officer Assignment"
        ],
        "services": {
            "ai_pipeline": {
                "available": AI_PIPELINE_AVAILABLE,
                "description": "LLMWhisperer OCR processing"
            },
            "claims_service": {
                "available": CLAIMS_SERVICE_AVAILABLE,
                "description": "PostgreSQL database with full CRUD"
            }
        },
        "supported_documents": ["PDF", "JPG", "PNG"],
        "supported_forms": ["IFR", "CR", "CFR", "Legacy Claims"],
        "environment": os.getenv("ENVIRONMENT", "development"),
        "python_version": f"{os.sys.version}",
        "database_url": os.getenv("DATABASE_URL", "Not configured")[:50] + "..." if os.getenv("DATABASE_URL") else "Not configured"
    }

# ============= PLACEHOLDER ENDPOINTS (Coming Soon) =============

@app.get("/api/v1/maps")
async def webgis_placeholder():
    """WebGIS and mapping endpoints - Coming soon"""
    return {
        "message": "🔄 WebGIS Service - Coming in Step 4", 
        "features": [
            "Interactive mapping with PostGIS",
            "Land boundary visualization",
            "Satellite imagery overlay",
            "Geospatial analysis tools"
        ],
        "technology": "PostgreSQL + PostGIS + Leaflet/OpenLayers"
    }

if __name__ == "__main__":
    # Production: Remove reload for better performance
    # Development: Use uvicorn command for auto-reload
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
    
    # For development with auto-reload:
    # uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
