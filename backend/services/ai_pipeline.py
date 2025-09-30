# services/ai_pipeline.py
import os
import sys
import tempfile
from typing import Dict, Any
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add ai-pipeline to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'ai-pipeline'))

from ocr_service import FRAOCRService

# Import claims service for database integration (not used for OCR processing)
try:
    from services.claims_service import claims_service
    DATABASE_INTEGRATION = True
    print("💾 Database integration available")
except ImportError:
    DATABASE_INTEGRATION = False
    print("⚠  Database integration not available")


class AtaviAIPipeline:
    """
    Aṭavī Atlas AI Pipeline Service Interface
    Connects main backend to AI processing services
    """
    
    def __init__(self):
        # Get API key from environment or use default
        self.api_key = os.getenv("LLMWHISPERER_API_KEY", "xjltT5sclQmrRobjlnbNDiNjcC0Q2L25jQxVpaV1u9M")
        
        # Initialize OCR service
        self.ocr_service = FRAOCRService(api_key=self.api_key)
        
        print(f"🔑 LLMWhisperer API Key loaded: {'✅' if self.api_key else '❌'}")
        print(f"🗃  Database integration: {'✅ Available' if DATABASE_INTEGRATION else '❌ Unavailable'}")

    async def process_document(self, file: UploadFile, form_type: str) -> Dict[str, Any]:
        """Process FRA document through OCR pipeline without saving to database"""
        temp_path = None
        try:
            # Validate file
            if not file.filename:
                raise HTTPException(status_code=400, detail="No file provided")
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_path = temp_file.name

            print(f"📄 Processing document: {file.filename} (Type: {form_type})")

            # Process through atlas OCR
            result = await self.ocr_service.process_fra_document(temp_path, form_type)
            
            # Handle OCR results
            if result.get("success"):
                print(f"✅ OCR processing successful for {file.filename}")
            else:
                print(f"❌ OCR processing failed for {file.filename}")
                result["database_info"] = {
                    "saved": False,
                    "message": "OCR processing failed, no data to save"
                }
            
            # Add processing metadata
            result["processing_info"] = {
                "filename": file.filename,
                "form_type": form_type,
                "ocr_success": result.get("success", False),
                "database_available": DATABASE_INTEGRATION,
                "atlas_version": "1.0.0"
            }
            
            return result

        except Exception as e:
            print(f"🔥 AI Pipeline error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"AI Pipeline error: {str(e)}")
        finally:
            # Cleanup temporary file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                    print(f"🧹 Cleaned up temporary file: {temp_path}")
                except:
                    pass  # Ignore cleanup errors

    def get_form_types(self) -> Dict[str, Any]:
        """Get supported form types"""
        try:
            return self.ocr_service.get_fra_form_types()
        except Exception as e:
            print(f"❌ Error getting form types: {str(e)}")
            return {
                "error": "Failed to get form types",
                "message": str(e)
            }

    def health_check(self) -> Dict[str, Any]:
        """Check AI Pipeline health"""
        return {
            "status": "healthy",
            "services": {
                "ocr_service": "✅ Available",
                "database_integration": "✅ Available" if DATABASE_INTEGRATION else "❌ Unavailable",
                "claims_storage": "✅ Active" if DATABASE_INTEGRATION else "❌ Inactive"
            },
            "api_key_configured": "✅" if self.api_key else "❌",
            "pilot_state": "Odisha",
            "supported_operations": [
                "Document OCR processing",
                "Form type detection (IFR, CR, CFR)",
                "Field extraction from FRA forms",
                "Database storage of claims" if DATABASE_INTEGRATION else "File-based storage only"
            ],
            "atlas_version": "1.0.0"
        }

    def get_database_status(self) -> Dict[str, Any]:
        """Check database connectivity and status"""
        if not DATABASE_INTEGRATION:
            return {
                "available": False,
                "message": "Database integration not configured"
            }
        
        try:
            # Test database connection through claims service
            claims = claims_service.get_all_claims()
            return {
                "available": True,
                "total_claims": len(claims),
                "connection": "✅ Active",
                "message": "Database connection successful"
            }
        except Exception as e:
            return {
                "available": False,
                "connection": "❌ Failed",
                "error": str(e),
                "message": "Database connection failed"
            }


# Global instance
try:
    ai_pipeline = AtaviAIPipeline()
    print("🚀 AI Pipeline initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize AI Pipeline: {str(e)}")
    ai_pipeline = None