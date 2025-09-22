"""Test claims service directly"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_claims_service():
    try:
        print("🧪 Testing claims service directly...")
        
        # Import and test
        from services.claims_service import claims_service
        
        print("✅ Claims service imported successfully")
        
        # Test database connection
        claims = claims_service.get_all_claims()
        print(f"📊 Claims found by service: {len(claims)}")
        
        if len(claims) == 0:
            print("❌ Claims service found 0 claims - checking connection...")
            
            # Test direct connection within claims_service
            db = claims_service.db
            result = db.execute("SELECT COUNT(*) FROM claims").fetchone()
            print(f"📊 Direct SQL query result: {result[0]}")
            
        else:
            print("✅ Claims service working correctly!")
            for claim in claims[:2]:  # Show first 2
                print(f"  - {claim['claimant_name']} from {claim['district']}")
        
    except Exception as e:
        print(f"❌ Error testing claims service: {e}")
        print(f"Error type: {type(e)}")

if __name__ == "__main__":
    test_claims_service()
