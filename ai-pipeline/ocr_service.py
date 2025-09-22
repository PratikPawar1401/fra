import re
import requests
import json
import os
import tempfile
from typing import Dict, Any, Optional
from unstract.llmwhisperer import LLMWhispererClientV2
from unstract.llmwhisperer.client_v2 import LLMWhispererClientException


class FRAOCRService:
    """
    Forest Rights Act OCR Processing Service
    Handles document processing for IFR, CR, CFR claims
    Focus: Odisha state pilot implementation
    """
    
    def __init__(self, api_key: str = None):
        if api_key is None:
            api_key = os.getenv("LLMWHISPERER_API_KEY", "xjltT5sclQmrRobjlnbNDiNjcC0Q2L25jQxVpaV1u9M")
        self.client = LLMWhispererClientV2(api_key=api_key)
        self.api_key = api_key
        
        # Enhanced field patterns for FRA forms
        self.NEW_CLAIM_FIELDS = {
            "FullName": r"Name of the claimant \(s\):\s*([^\n]+)",
            "Spouse": r"Name of the spouse\s*:\s*([^\n]+)",
            "Parent": r"Name of father/ mother\s*:?\s*([^\n]+)",
            "Address": r"Address:\s*([^\n]+)",
            "Village": r"Village:\s*([^\n]+)",
            "GramPanchayat": r"Gram Panchayat:\s*([^\n]+)",
            "Tehsil": r"Tehsil/ Taluka:\s*([^\n]+)",
            "District": r"District:\s*([^\n]+)",
            "State": r"State:\s*([^\n]+)",
            "ScheduledTribe": r"Scheduled Tribe:\s*([^\n]+)",
            "OtherForestDweller": r"Other Traditional Forest Dweller:\s*([^\n]+)",
            "FamilyMembers": r"Name of other members in the family with age:\s*([^\n]+)",
            "HabitationArea": r"for habitation\s*:\s*([^\n]+)",
            "CultivationArea": r"for self-cultivation.*?:\s*([^\n]+)",
            "DisputedLands": r"Disputed lands if any:\s*([^\n]+)",
            "PattasLeasesGrants": r"Pattas/ leases/ grants, if any:\s*([^\n]+)",
            "Evidence": r"Evidence in support:\s*([^\n]+)",
            "FormHeading": r"(FORM\s*-\s*[A-Z])"
        }
        
        self.LEGACY_CLAIM_FIELDS = {
            "HolderNames": r"Name\(s\) of holder \(s\) of forest rights:\s*([^\n]+)",
            "ParentNames": r"Name of the father/ mother:\s*([^\n]+)", 
            "Address": r"Address:\s*([^\n]+)",
            "VillageOrGramSabha": r"Village/gram sabha:\s*([^\n]+)",
            "District": r"District:\s*([^\n]+)",
            "State": r"State:\s*([^\n]+)",
            "Area": r"Area\s*:\s*([^\n]+)",
            "Boundaries": r"Description of boundaries.*:\s*([^\n]+)"
        }

    def detect_form_subtype(self, result_text: str) -> Optional[str]:
        """Detect IFR, CR, or CFR form types"""
        if re.search(r"FORM\s*-\s*A", result_text, re.IGNORECASE):
            return "IFR"  # Individual Forest Rights
        elif re.search(r"FORM\s*-\s*B", result_text, re.IGNORECASE):
            return "CR"   # Community Rights
        elif re.search(r"FORM\s*-\s*C", result_text, re.IGNORECASE):
            return "CFR"  # Community Forest Rights
        return None

    def extract_fields(self, result_text: str, form_type: str) -> Dict[str, str]:
        """Extract structured data from OCR text based on form type"""
        target_fields = (
            self.NEW_CLAIM_FIELDS if form_type == "new_claim" 
            else self.LEGACY_CLAIM_FIELDS if form_type == "legacy_claim"
            else {}
        )
        
        if not target_fields:
            raise ValueError(f"Unknown form_type: {form_type}")

        extracted = {}
        for field, pattern in target_fields.items():
            match = re.search(pattern, result_text, re.IGNORECASE)
            extracted[field] = match.group(1).strip() if match else ""
        
        return extracted

    def map_to_atlas_claim_structure(self, extracted_fields: Dict[str, str], 
                                   form_type: str, form_subtype: Optional[str]) -> Dict[str, Any]:
        """
        Map OCR results to Aṭavī Atlas claim structure
        Optimized for Odisha state requirements
        """
        
        if form_type == "new_claim":
            claimant_name = extracted_fields.get("FullName", "")
            district = extracted_fields.get("District", "")
            state = extracted_fields.get("State", "Odisha")  # Default to pilot state
            village_name = extracted_fields.get("Village", "")
            form_display = f"{form_subtype}" if form_subtype else "New Claim"
            
        elif form_type == "legacy_claim":
            claimant_name = extracted_fields.get("HolderNames", "")
            district = extracted_fields.get("District", "")
            state = extracted_fields.get("State", "Odisha")
            village_name = extracted_fields.get("VillageOrGramSabha", "")
            form_display = "Legacy - Granted Title"
        
        # Create comprehensive comments for atlas system
        comments = f"Processed via Aṭavī Atlas OCR\n"
        comments += f"Form Type: {form_display}\n"
        comments += f"State: {state}\n"
        comments += f"District: {district}\n"
        comments += f"Village: {village_name}\n"
        
        return {
            "claimant_name": claimant_name,
            "village_id": 1,  # Will be mapped with proper village database
            "district": district,
            "state": state,
            "form_type": form_display,
            "comments": comments,
            "status": "Pending OCR Review",
            "pilot_state": "Odisha",
            "extracted_data": extracted_fields,
            "form_subtype": form_subtype
        }

    async def process_fra_document(self, file_path: str, form_type: str) -> Dict[str, Any]:
        """
        Main FRA document processing for Aṭavī Atlas
        Returns atlas-ready claim data
        """
        try:
            # Process with LLMWhisperer
            result = self.client.whisper(
                file_path=file_path,
                wait_for_completion=True,
                wait_timeout=300,
                mode="form",
                output_mode="layout_preserving"
            )
            
            result_text = result.get("extraction", {}).get("result_text", "")
            
            # Extract fields
            fields = self.extract_fields(result_text, form_type)
            
            # Detect form subtype
            subtype = self.detect_form_subtype(result_text) if form_type == "new_claim" else "Granted Title"
            
            # Map to atlas structure
            atlas_claim = self.map_to_atlas_claim_structure(fields, form_type, subtype)
            
            return {
                "success": True,
                "atlas_claim_data": atlas_claim,
                "ocr_metadata": {
                    "raw_text": result_text,
                    "extracted_fields": fields,
                    "form_type": form_type,
                    "form_subtype": subtype,
                    "processing_timestamp": result.get("extraction", {}).get("timestamp"),
                    "atlas_version": "1.0.0",
                    "pilot_state": "Odisha"
                }
            }
            
        except LLMWhispererClientException as e:
            return {
                "success": False,
                "error": "LLMWhisperer OCR Error",
                "message": e.message,
                "status_code": e.status_code or 500
            }
        except Exception as e:
            return {
                "success": False,
                "error": "Atlas OCR Processing Error",
                "message": str(e)
            }

    def get_fra_form_types(self) -> Dict[str, Any]:
        """Get FRA form types supported by Aṭavī Atlas"""
        return {
            "new_claim": {
                "name": "New FRA Claim",
                "description": "Fresh forest rights applications",
                "subtypes": ["IFR", "CR", "CFR"],
                "subtype_descriptions": {
                    "IFR": "Individual Forest Rights",
                    "CR": "Community Rights", 
                    "CFR": "Community Forest Rights"
                },
                "pilot_focus": "Odisha districts"
            },
            "legacy_claim": {
                "name": "Legacy Claim", 
                "description": "Existing granted forest rights",
                "subtypes": ["Granted Title"],
                "subtype_descriptions": {
                    "Granted Title": "Previously approved forest rights"
                },
                "pilot_focus": "Odisha historical records"
            }
        }
