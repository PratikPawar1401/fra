from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from datetime import datetime
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

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🌳 Starting Aṭavī Atlas - FRA Decision Support System...")
    print(f"🎯 Pilot State: Odisha")
    print(f"📡 AI Pipeline: {'✅ Available' if AI_PIPELINE_AVAILABLE else '❌ Unavailable'}")
    print(f"🗃️  Database: PostgreSQL + PostGIS (Coming)")
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
            "claims_management": "🔄 Coming",
            "document_ocr": "✅ Active" if AI_PIPELINE_AVAILABLE else "❌ Unavailable", 
            "webgis": "🔄 Coming",
            "asset_mapping": "🔄 Coming",
            "decision_support": "🔄 Coming",
            "analytics": "🔄 Coming"
        },
        "documentation": "/api/docs",
        "endpoints": {
            "health": "/health",
            "api_info": "/api/v1",
            "ocr_service": "/api/v1/ocr/",
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
            "database": "🔄 pending setup",
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
            "claims_management": "🔄 Development",
            "webgis_operations": "🔄 Development", 
            "asset_mapping": "🔄 Development",
            "decision_support": "🔄 Development"
        },
        "available_endpoints": {
            "ocr_process": "/api/v1/ocr/process-document",
            "ocr_forms": "/api/v1/ocr/form-types", 
            "ai_status": "/api/v1/ai-pipeline/status",
            "claims": "/api/v1/claims (Coming)",
            "maps": "/api/v1/maps (Coming)"
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
    return {
        "ai_pipeline_available": AI_PIPELINE_AVAILABLE,
        "services": {
            "ocr_service": {
                "status": "✅ Available" if AI_PIPELINE_AVAILABLE else "❌ Unavailable",
                "description": "LLMWhisperer-powered OCR for FRA documents",
                "supported_forms": ["IFR", "CR", "CFR", "Legacy Claims"]
            },
            "asset_mapping": {
                "status": "🔄 Development",
                "description": "Sentinel-2 satellite imagery analysis with Random Forest ML"
            },
            "decision_support": {
                "status": "🔄 Development", 
                "description": "AI-powered government scheme recommendations"
            }
        },
        "pilot_state": "Odisha",
        "atlas_version": "1.0.0",
        "technology_stack": {
            "ocr": "LLMWhisperer + Custom NER",
            "ml_models": "Random Forest, Computer Vision",
            "satellite_data": "Sentinel-2",
            "backend": "FastAPI + PostgreSQL + PostGIS"
        }
    }

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

# ============= PLACEHOLDER ENDPOINTS (Coming Soon) =============

@app.get("/api/v1/claims")
async def claims_placeholder():
    """Claims management endpoints - Coming in database setup"""
    return {
        "message": "🔄 Claims Management Service - Coming in Step 3",
        "features": [
            "CRUD operations for FRA claims",
            "Search and filtering",
            "Status workflow management", 
            "Document attachment handling"
        ],
        "integration": "Will integrate with OCR processed data"
    }

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

@app.get("/api/v1/analytics")
async def analytics_placeholder():
    """Analytics and decision support endpoints"""
    return {
        "message": "🔄 Analytics & Decision Support - Coming soon",
        "features": [
            "FRA implementation dashboard",
            "Claim processing statistics",
            "Government scheme recommendations", 
            "State-wise performance metrics"
        ],
        "focus": "Odisha pilot analytics"
    }

# ============= DEVELOPMENT HELPERS =============

@app.get("/api/v1/system/info")
async def system_info():
    """System information for development and debugging"""
    return {
        "atlas_version": "1.0.0",
        "python_version": f"{os.sys.version}",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "ai_pipeline_available": AI_PIPELINE_AVAILABLE,
        "database_url": os.getenv("DATABASE_URL", "Not configured"),
        "pilot_state": "Odisha",
        "upload_dir": os.getenv("UPLOAD_DIR", "uploads/"),
        "max_file_size": "50MB"
    }

# ============= MAIN ROUTER INCLUDES (Coming) =============

# When we create route files, we'll uncomment these:
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# app.include_router(claims.router, prefix="/api/v1/claims", tags=["Claims Management"]) 
# app.include_router(documents.router, prefix="/api/v1/documents", tags=["Document Processing"])
# app.include_router(maps.router, prefix="/api/v1/maps", tags=["WebGIS & Mapping"])

if __name__ == "__main__":
    # Production: Remove reload for better performance
    # Development: Use uvicorn command for auto-reload
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
    
    # For development with auto-reload:
    # uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
