import os
import json
import ee
import geemap
from fastapi import HTTPException
from typing import Dict, Any
from datetime import datetime
from .claims_service import claims_service, GISAsset, GISAnalytics

CLOUD_PROJECT_ID = 'fra-atlas-472812'
CLASSIFIER_ASSET_ID = 'projects/fra-atlas-472812/assets/rf_model_odisha_multiclass_v1'

FROM_CLASSES = [10, 20, 30, 40, 50, 60, 80, 90]
TO_CLASSES = [0, 1, 1, 2, 3, 3, 4, 4]

CLASS_PALETTE_NAMES = {
    0: 'Forest',
    1: 'Shrub & Grassland',
    2: 'Agriculture', 
    3: 'Urban & Barren Land',
    4: 'Water & Wetland'
}

VIS_PALETTE_COLORS = ['#228B22', '#C2B280', '#FFD700', '#A9A9A9', '#4169E1']

class WebGISService:
    def __init__(self):
        self.initialize_gee()
    
    def initialize_gee(self):
        try:
            ee.Initialize(project=CLOUD_PROJECT_ID)
            print("✅ Google Earth Engine initialized")
        except Exception as e:
            try:
                ee.Authenticate()
                ee.Initialize(project=CLOUD_PROJECT_ID)
                print("✅ GEE authenticated and initialized")
            except Exception as auth_error:
                print(f"❌ GEE initialization failed: {auth_error}")
                # For testing, don't raise exception
                print("⚠️ Running in demo mode without GEE")
    
    def analyze_geojson_for_claim(self, geojson_data: dict, claim_id: int) -> Dict[str, Any]:
        try:
            claim = claims_service.get_claim_by_id(claim_id, include_full_data=False)
            if not claim:
                raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")
            
            # For now, return mock data for testing
            mock_results = {
                "analytics": {
                    "Forest": 45.67,
                    "Agriculture": 23.45,
                    "Shrub & Grassland": 12.34,
                    "Urban & Barren Land": 8.90,
                    "Water & Wetland": 5.64
                },
                "satellite_image_url": "https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/mock-tile-url/{z}/{x}/{y}?token=mock",
                "total_area_hectares": 96.0,
                "forest_coverage_percent": 47.6
            }
            
            # Store results in database
            storage_result = self._store_webgis_outputs(claim_id, mock_results, geojson_data)
            
            return {
                "success": True,
                "claim_id": claim_id,
                "gee_analysis": mock_results,
                "output_storage": storage_result,
                "processing_info": {
                    "processed_at": datetime.now().isoformat(),
                    "atlas_version": "1.0.0"
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"WebGIS processing failed: {str(e)}")
    
    def _store_webgis_outputs(self, claim_id: int, gee_results: dict, geojson_data: dict) -> Dict[str, Any]:
        try:
            db = claims_service.db
            
            gis_asset = GISAsset(
                claim_id=claim_id,
                asset_type="satellite_analysis",
                asset_name=f"Sentinel-2 Land Classification - Claim {claim_id}",
                asset_description="Satellite-based land use classification",
                satellite_image_url=gee_results["satellite_image_url"],
                land_classification_results=gee_results["analytics"],
                satellite_data_source="Sentinel-2",
                processing_date_range="2022-01-01 to 2022-12-31",
                gee_project_id=CLOUD_PROJECT_ID
            )
            
            db.add(gis_asset)
            db.commit()
            db.refresh(gis_asset)
            
            total_area = gee_results["total_area_hectares"]
            
            for land_class, area_hectares in gee_results["analytics"].items():
                percentage = (area_hectares / total_area * 100) if total_area > 0 else 0
                
                analytics_record = GISAnalytics(
                    claim_id=claim_id,
                    asset_id=gis_asset.id,
                    land_class_name=land_class,
                    area_hectares=area_hectares,
                    percentage_of_total=round(percentage, 2),
                    model_version="rf_model_odisha_multiclass_v1"
                )
                
                db.add(analytics_record)
            
            db.commit()
            
            return {"type": "PostgreSQL", "status": "success", "asset_id": gis_asset.id}
        except Exception as e:
            db.rollback()
            return {"type": "PostgreSQL", "status": "failed", "error": str(e)}
    
    def get_claim_webgis_data(self, claim_id: int) -> Dict[str, Any]:
        try:
            db = claims_service.db
            
            assets = db.query(GISAsset).filter(GISAsset.claim_id == claim_id).all()
            analytics = db.query(GISAnalytics).filter(GISAnalytics.claim_id == claim_id).all()
            
            return {
                "claim_id": claim_id,
                "has_webgis_data": len(assets) > 0,
                "analysis_outputs": [
                    {
                        "asset_id": asset.id,
                        "type": asset.asset_type,
                        "name": asset.asset_name,
                        "satellite_image_url": asset.satellite_image_url,
                        "land_classification": asset.land_classification_results,
                        "processing_date": asset.created_date.isoformat() if asset.created_date else None,
                        "satellite_source": asset.satellite_data_source
                    }
                    for asset in assets
                ],
                "detailed_analytics": [
                    {
                        "land_class": analytic.land_class_name,
                        "area_hectares": analytic.area_hectares,
                        "percentage": analytic.percentage_of_total,
                        "analysis_date": analytic.analysis_date.isoformat() if analytic.analysis_date else None
                    }
                    for analytic in analytics
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving WebGIS data: {str(e)}")

webgis_service = WebGISService()
