import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.claims_service import claims_service
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def fix_database_transaction():
    """Fix aborted database transaction"""
    
    # Get database URL from environment
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:daksh7743@localhost:5432/fra_atlas_db")
    
    try:
        # Connect directly to PostgreSQL
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if there are any active transactions
        cursor.execute("SELECT COUNT(*) FROM claims;")
        result = cursor.fetchone()
        
        print(f"Current claims in database: {result[0] if result else 0}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        # Reset claims service connection
        claims_service.close()
        
        print("✅ Database connection reset successfully")
        print("🚀 Restart your server and try document processing again")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing transaction: {e}")
        return False

if __name__ == "__main__":
    fix_database_transaction()
