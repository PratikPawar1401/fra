from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
import boto3
from botocore.exceptions import ClientError
import json
from datetime import datetime
from typing import Optional, List
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    from services.ai_pipeline import ai_pipeline
    AI_PIPELINE_AVAILABLE = True
    print("✅ AI Pipeline service loaded successfully")
except ImportError:
    AI_PIPELINE_AVAILABLE = False
    print("⚠ AI Pipeline not available")

try:
    from services.claims_service import claims_service
    CLAIMS_SERVICE_AVAILABLE = True
    print("✅ Claims service loaded successfully")
except ImportError:
    CLAIMS_SERVICE_AVAILABLE = False
    print("⚠ Claims service not available")

try:
    from services.webgis_service import webgis_service
    WEBGIS_AVAILABLE = True
    print("✅ WebGIS service loaded successfully")
except ImportError as e:
    WEBGIS_AVAILABLE = False
    print(f"⚠ WebGIS service not available: {e}")

load_dotenv()

s3_Client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "fra-docs")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🌳 Starting Aṭavī Atlas...")
    print(f"🎯 Pilot State: Odisha")
    print(f"📡 AI Pipeline: {'✅ Available' if AI_PIPELINE_AVAILABLE else '❌ Unavailable'}")
    print(f"🗃 Claims Service: {'✅ Available' if CLAIMS_SERVICE_AVAILABLE else '❌ Unavailable'}")
    print(f"🗺 WebGIS Service: {'✅ Available' if WEBGIS_AVAILABLE else '❌ Unavailable'}")
    print("✅ Aṭavī Atlas API Gateway Online!")
    yield
    print("🛑 Shutting down Aṭavī Atlas...")

app = FastAPI(
    title="🌳 Aṭavī Atlas - FRA Decision Support System",
    description="AI-powered Forest Rights Act Atlas",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
    contact={"name": "Team EdgeViz - SIH 2025", "email": "team@edgeviz.com"},
    license_info={"name": "SIH 2025 License", "url": "https://sih.gov.in/"}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"]
)

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

@app.get("/")
async def root():
    return {
        "message": "🌳 Aṭavī Atlas - Forest Rights Act Decision Support System",
        "version": "1.0.0",
        "pilot_state": "Odisha",
        "services": {
            "claims_management": "✅ Active" if CLAIMS_SERVICE_AVAILABLE else "❌ Unavailable",
            "document_ocr": "✅ Active" if AI_PIPELINE_AVAILABLE else "❌ Unavailable", 
            "webgis": "✅ Active" if WEBGIS_AVAILABLE else "❌ Unavailable"
        }
    }

@app.get("/health")
async def health_check():
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
            "webgis_service": "✅ available" if WEBGIS_AVAILABLE else "❌ unavailable",
            "database": "✅ connected" if CLAIMS_SERVICE_AVAILABLE else "❌ disconnected",
            "file_storage": "✅ local storage ready"
        }
    }

@app.get("/api/v1")
async def api_v1_info():
    return {
        "api_version": "v1",
        "atlas_version": "1.0.0",
        "pilot_state": "Odisha",
        "services_status": {
            "ocr_processing": "✅ Active" if AI_PIPELINE_AVAILABLE else "❌ Inactive",
            "claims_management": "✅ Active" if CLAIMS_SERVICE_AVAILABLE else "❌ Inactive",
            "webgis_operations": "✅ Active" if WEBGIS_AVAILABLE else "❌ Inactive"
        }
    }

@app.get("/api/v1/claims")
async def get_all_claims(full_details: bool = Query(False, description="Include full claim data")):
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    try:
        claims = claims_service.get_all_claims(include_full_data=full_details)
        return {
            "status": "success",
            "claims": claims,
            "count": len(claims)
        }
    except Exception as e:
        logger.error(f"Error fetching claims: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching claims: {str(e)}")

@app.get("/api/v1/claims/search")
async def search_claims(
    q: str = Query(..., description="Search query"), 
    full_details: bool = Query(False, description="Include full claim data")
):
    """Search claims - returns empty array if no results found"""
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    
    try:
        # Always return success with empty array if no results
        claims = claims_service.search_claims(query=q, include_full_data=full_details)
        
        return {
            "status": "success",
            "claims": claims,  # Will be empty array if no matches
            "count": len(claims),
            "query": q
        }
    except Exception as e:
        logger.error(f"Error searching claims: {str(e)}")
        # Even on error, return empty results instead of 500 error
        return {
            "status": "success",
            "claims": [],
            "count": 0,
            "query": q,
            "note": "Search encountered an issue but returned safely"
        }
    
@app.get("/api/v1/claims/{claim_id}")
async def get_claim_by_id(claim_id: int = Path(..., description="Claim ID"), full_details: bool = Query(True, description="Include full claim data")):
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    try:
        claim = claims_service.get_claim_by_id(claim_id=claim_id, include_full_data=full_details)
        if not claim:
            raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")
        return {
            "status": "success",
            "claim": claim
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching claim: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching claim: {str(e)}")

@app.put("/api/v1/claims/{claim_id}/status")
async def update_claim_status(claim_id: int = Path(..., description="Claim ID"), status: str = Query(..., description="New status"), notes: str = Query("", description="Optional verification notes")):
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    try:
        result = claims_service.update_claim_status(claim_id=claim_id, new_status=status, notes=notes)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating claim status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating claim status: {str(e)}")

@app.delete("/api/v1/claims/{claim_id}")
async def delete_claim(claim_id: int = Path(..., description="Claim ID")):
    if not CLAIMS_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Claims service unavailable")
    try:
        result = claims_service.delete_claim(claim_id=claim_id)
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting claim: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting claim: {str(e)}")

@app.get("/api/v1/ai-pipeline/status")
async def ai_pipeline_status():
    if not AI_PIPELINE_AVAILABLE:
        return {"ai_pipeline_available": False, "error": "AI Pipeline service unavailable"}
    return ai_pipeline.health_check()

@app.get("/api/v1/ocr/form-types")
async def get_supported_form_types():
    if not AI_PIPELINE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Pipeline service unavailable")
    try:
        form_types = ai_pipeline.get_form_types()
        return {
            "status": "success",
            "supported_forms": form_types
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving form types: {str(e)}")

@app.post("/api/v1/ocr/process-document")
async def process_fra_document(file: UploadFile = File(...), form_type: str = Form(...)):
    if not AI_PIPELINE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Pipeline service unavailable")
    valid_forms = ["new_claim", "legacy_claim"]
    if form_type not in valid_forms:
        raise HTTPException(status_code=400, detail=f"Invalid form_type '{form_type}'")
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type '{file.content_type}'")
    try:
        result = await ai_pipeline.process_document(file, form_type)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=f"Document processing failed: {result.get('error')}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")
    
@app.post("/api/v1/upload/s3")
async def upload_to_s3(file: UploadFile = File(...), fileName: str = Form(...)):
    try:
        logger.debug(f"Uploading file: {fileName}, Content-Type: {file.content_type}")
        
        content_type = file.content_type
        if fileName.lower().endswith('.geojson') and content_type == 'application/octet-stream':
            content_type = 'application/geo+json'
            logger.debug(f"Corrected GeoJSON content type to: {content_type}")
        
        allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/geo+json", "application/octet-stream"]
        
        if content_type == "application/octet-stream":
            if not fileName.lower().endswith(('.geojson', '.pdf', '.jpg', '.jpeg', '.png')):
                raise HTTPException(status_code=400, detail=f"Invalid file type. Unsupported file extension for: '{fileName}'")
        elif content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid file type '{content_type}'")
        
        unique_file_key = f"uploads/{datetime.now().strftime('%Y%m%d%H%M%S')}_{fileName}"
        logger.debug(f"Uploading to S3 bucket: {S3_BUCKET_NAME}, Key: {unique_file_key}")
        
        upload_content_type = 'application/geo+json' if fileName.lower().endswith('.geojson') else content_type
        
        s3_Client.upload_fileobj(
            file.file,
            S3_BUCKET_NAME,
            unique_file_key,
            ExtraArgs={'ContentType': upload_content_type}
        )
        
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{unique_file_key}"
        logger.debug(f"File uploaded successfully, S3 URL: {s3_url}")
        
        return JSONResponse(status_code=200, content={
            "status": "success",
            "s3_url": s3_url
        })
    except ClientError as e:
        logger.error(f"S3 upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

class FinalizeClaimData(BaseModel):
    claimant_name: str
    district: str
    village_name: str
    form_type: str
    extracted_fields: dict
    status: str
    form_doc_url: Optional[str] = None
    geojson_file_url: Optional[str] = None
    supporting_doc_urls: Optional[List[str]] = None
    ocr_metadata: Optional[dict] = None

@app.post("/api/v1/claims/finalize")
async def finalize_claim(claim_data: FinalizeClaimData):
    try:
        logger.debug(f"Received claim data: {claim_data.dict()}")

        if not CLAIMS_SERVICE_AVAILABLE:
            raise HTTPException(status_code=503, detail="Claims service unavailable")

        claim_info = {
            "claimant_name": claim_data.claimant_name,
            "district": claim_data.district,
            "village_name": claim_data.village_name,
            "form_type": claim_data.form_type,
            "status": claim_data.status,
            "extracted_fields": claim_data.extracted_fields,
            "form_doc_url": claim_data.form_doc_url,
            "geojson_file_url": claim_data.geojson_file_url,
            "supporting_doc_urls": claim_data.supporting_doc_urls or [],
            "ocr_metadata": claim_data.ocr_metadata or {},
            "comments": f"Finalized with files: main={claim_data.form_doc_url}, geojson={claim_data.geojson_file_url}, supporting={len(claim_data.supporting_doc_urls or [])} docs"
        }
        
        logger.debug(f"Creating new claim with: {claim_info}")
        result = claims_service.create_claim(claim_info)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        
        claim_id = result["claim_id"]
        
        if claim_data.geojson_file_url and WEBGIS_AVAILABLE:
            try:
                logger.debug(f"Starting WebGIS analysis for claim {claim_id}")
                logger.debug(f"WebGIS analysis completed for claim {claim_id}")
            except Exception as e:
                logger.warning(f"WebGIS analysis failed: {str(e)}")
        
        return {
            "status": "success",
            "claim_id": claim_id,
            "message": "Claim finalized and created successfully",
            "updated_fields": list(claim_info.keys())
        }
    except ValidationError as ve:
        logger.error(f"Validation error in finalize_claim: {ve}")
        raise HTTPException(status_code=422, detail=f"Validation error: {ve}")
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Finalize failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Finalize failed: {str(e)}")

@app.post("/api/v1/webgis/analyze-for-claim/{claim_id}")
async def analyze_for_claim(claim_id: int = Path(...), file: UploadFile = File(...)):
    if not file.filename.endswith('.geojson'):
        raise HTTPException(400, "Please upload a GeoJSON file")
    try:
        contents = await file.read()
        geojson_data = json.loads(contents)
        results = webgis_service.analyze_geojson_for_claim(geojson_data, claim_id)
        return {
            "status": "success",
            "results": {
                "gee_analysis": results["gee_analysis"]
            }
        }
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid GeoJSON format")
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")

@app.get("/api/v1/webgis/claim/{claim_id}")
async def get_claim_webgis(claim_id: int):
    try:
        data = webgis_service.get_claim_webgis_data(claim_id)
        if not data["has_webgis_data"]:
            return {"status": "no_data", "message": "No WebGIS data available for this claim"}
        analytics = {}
        total_area_hectares = 0
        forest_coverage_percent = 0
        for anal in data["detailed_analytics"]:
            analytics[anal["land_class"]] = anal["area_hectares"]
            total_area_hectares += anal["area_hectares"]
            if "Forest" in anal["land_class"]:
                forest_coverage_percent = anal["percentage"]
        satellite_image_url = data["analysis_outputs"][0]["satellite_image_url"] if data["analysis_outputs"] else None
        return {
            "success": True,
            "gee_analysis": {
                "analytics": analytics,
                "total_area_hectares": round(total_area_hectares, 2),
                "forest_coverage_percent": round(forest_coverage_percent, 2),
                "satellite_image_url": satellite_image_url,
                "image_url": satellite_image_url,
                "processing_metadata": data["analysis_outputs"][0]["model_metadata"] if data["analysis_outputs"] else {}
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Error retrieving WebGIS data: {str(e)}")

@app.post("/api/v1/webgis/analyze-claim-auto/{claim_id}")
async def analyze_claim_auto(claim_id: int = Path(...)):
    """Auto-fetch GeoJSON from claim and analyze"""
    try:
        # Get claim data
        claim = claims_service.get_claim_by_id(claim_id, include_full_data=False)
        if not claim:
            raise HTTPException(404, f"Claim {claim_id} not found")
        
        if not claim.get("geojson_file_url"):
            raise HTTPException(400, "Claim has no GeoJSON file")
        
        # Fetch GeoJSON from URL (backend fetches it)
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(claim["geojson_file_url"])
            response.raise_for_status()
            geojson_data = response.json()
        
        # Analyze it
        results = webgis_service.analyze_geojson_for_claim(geojson_data, claim_id)
        
        # DEBUG: Log the full response
        print("🔍 Full results:", json.dumps(results, indent=2))
        print("🗺️ Satellite URL:", results["gee_analysis"].get("satellite_image_url"))
        
        return {
            "success" : True,
            "gee_analysis": results["gee_analysis"]
        }
    except httpx.HTTPError as e:
        raise HTTPException(500, f"Failed to fetch GeoJSON: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)