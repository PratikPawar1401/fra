"""
Database setup script for Aṭavī Atlas
Creates PostgreSQL database with PostGIS extension
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from config.database import engine, test_connection
from models import Base

def create_database():
    """Create the fra_atlas_db database"""
    try:
        # Connect to PostgreSQL server (not specific database)
        conn = psycopg2.connect(
            host="localhost",
            user="postgres", 
            password="yourpassword"  # Replace with your PostgreSQL password
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Create database
        cursor.execute("CREATE DATABASE fra_atlas_db;")
        print("✅ Database 'fra_atlas_db' created successfully")
        
        cursor.close()
        conn.close()
        
    except psycopg2.errors.DuplicateDatabase:
        print("📋 Database 'fra_atlas_db' already exists")
    except Exception as e:
        print(f"❌ Error creating database: {e}")

def setup_postgis():
    """Enable PostGIS extension"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="yourpassword",  # Replace with your PostgreSQL password
            database="fra_atlas_db"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Enable PostGIS extension
        cursor.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        print("✅ PostGIS extension enabled")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error setting up PostGIS: {e}")

def create_tables():
    """Create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    print("🌳 Setting up Aṭavī Atlas Database...")
    print("📍 Target: PostgreSQL with PostGIS for Odisha pilot")
    
    # Step 1: Create database
    create_database()
    
    # Step 2: Enable PostGIS
    setup_postgis()
    
    # Step 3: Test connection
    if test_connection():
        print("✅ Database connection successful")
        
        # Step 4: Create tables
        create_tables()
        
        print("🎉 Database setup complete!")
    else:
        print("❌ Database setup failed")
