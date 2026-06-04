const API_URL = 'http://localhost:8000/notes';
let localNotesArray = []; // Local runtime cache mirror for real-time searching and filtering

document.addEventListener('DOMContentLoaded', () => {
    fetchNotes();

    // Attach listeners to trigger the sorting/filtering engine instantly on input change
    document.getElementById('searchBar').addEventListener('input', filterAndRenderNotes);
    document.getElementById('sortOrder').addEventListener('change', filterAndRenderNotes);

    // Handle Form Submission (CREATE Note)
    document.getElementById('noteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                document.getElementById('noteForm').reset();
                fetchNotes(); // Reload lists immediately from the backend database
            } else {
                alert('Failed to save note.');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            alert('Failed to save note. Is Docker running?');
        }
    });

    // Handle Save Button inside Edit Modal (UPDATE Note)
    document.getElementById('saveEditBtn').addEventListener('click', async () => {
        const id = document.getElementById('editNoteId').value;
        const title = document.getElementById('editTitle').value;
        const content = document.getElementById('editContent').value;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                closeModal();
                fetchNotes();
            } else {
                alert('Failed to update note.');
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    });
});

// Fetch all notes from DB container (READ Note)
async function fetchNotes() {
    const errorBar = document.getElementById('errorLocation');
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Backend server error');
        
        // Save database response records into our local cache array
        localNotesArray = await response.json();
        errorBar.style.display = 'none';
        
        // Pass control over to the display engine to handle filtering/sorting
        filterAndRenderNotes();
    } catch (error) {
        console.error('Error fetching notes:', error);
        errorBar.style.display = 'block';
    }
}

// Client-Side Data Matrix Filter and Sorting Engine
function filterAndRenderNotes() {
    const container = document.getElementById('notesContainer');
    const searchQuery = document.getElementById('searchBar').value.toLowerCase();
    const sortValue = document.getElementById('sortOrder').value;

    container.innerHTML = '';

    // 1. Text Search Filter matching Title names
    let processedNotes = localNotesArray.filter(note => 
        note.title.toLowerCase().includes(searchQuery)
    );

    // 2. Sorting Arrangement Logic Execution
    if (sortValue === 'newest') {
        processedNotes.sort((a, b) => b.id - a.id); // Higher primary keys go up top
    } else if (sortValue === 'oldest') {
        processedNotes.sort((a, b) => a.id - b.id); // Earliest sequences first
    } else if (sortValue === 'alphabetical') {
        processedNotes.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 3. Render processed elements onto the UI list container
    if (processedNotes.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic; text-align: center; margin-top: 30px;">No matching baked notes found.</p>';
        return;
    }

    processedNotes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
            <h4>${escapeHtml(note.title)}</h4>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button class="btn-edit" onclick="openEditModal(${note.id}, '${escapeJs(note.title)}', '${escapeJs(note.content)}')">Edit</button>
                <button class="btn-delete" onclick="deleteNote(${note.id})">Delete</button>
            </div>
        `;
        container.appendChild(noteElement);
    });
}

// Remove a note from DB container (DELETE Note)
async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchNotes();
        } else {
            alert('Failed to delete note.');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}

// Modal Utility Control Functions
function openEditModal(id, title, content) {
    document.getElementById('editNoteId').value = id;
    document.getElementById('editTitle').value = title;
    document.getElementById('editContent').value = content;
    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Helper functions to keep text renderings safe
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function escapeJs(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}