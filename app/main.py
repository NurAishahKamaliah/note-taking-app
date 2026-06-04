from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <-- Added this line
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import models
from database import engine, get_db

# This creates all tables in PostgreSQL automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ── CORS Middleware Configuration ──────────────────
# This tells the backend container it is safe to accept requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your frontend on port 8080 to communicate smoothly
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE
    allow_headers=["*"],
)

# ── Pydantic Schemas ──────────────────────────────
# These define what data comes IN and goes OUT of your API

class NoteCreate(BaseModel):
    title: str
    content: str

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str

    class Config:
        from_attributes = True


# ── API Endpoints ─────────────────────────────────

# CREATE a note
@app.post("/notes", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    new_note = models.Note(title=note.title, content=note.content)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


# READ all notes
@app.get("/notes", response_model=List[NoteResponse])
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(models.Note).all()
    return notes


# READ a single note by ID
@app.get("/notes/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


# UPDATE a note
@app.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, updated: NoteCreate, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    note.title = updated.title
    note.content = updated.content
    db.commit()
    db.refresh(note)
    return note


# DELETE a note
@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}