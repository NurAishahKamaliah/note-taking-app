from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# This is the connection string to PostgreSQL
# "db" is the container name in docker-compose.yml
DATABASE_URL = "postgresql://user:password@db:5432/notesdb"

# Create the connection engine
engine = create_engine(DATABASE_URL)

# Each request to the API gets its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for your database models
Base = declarative_base()

# This function gives FastAPI a database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()