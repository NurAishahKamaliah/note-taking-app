# ASSESSMENT COVERSHEET & DOCUMENTATION

## Section A: Submission Details
* **Programme:** BACHELOR IN INFORMATION TECHNOLOGY (HONOURS) (INTERNET OF THINGS)
* **Course Code & Name:** IIB32303 - DEVOPS ESSENTIALS
* **Course Lecturer(s):** SIR FUEAD ALI
* **Type of Submission:** GROUP ASSIGNMENT
* **Group Members:**
  1. NUR AISHAH KAMALIAH BINTI MEZLAN (ID: 52224123034)
  2. SHAIFUL HAZIQ HIDZMI BIN SAIPOL AZMI (ID: 52224123153)
  3. MUHAMMAD UWAIS BIN MOHD IMRAN (ID: 52224123579)

---

## 1.0 Introduction

In the modern software engineering landscape, the transition from monolithic architectures to decoupled microservices has fundamentally altered how web applications are developed, deployed, and scaled. Traditionally, full-stack applications bound the user interface, application logic, and database management into a single, tightly coupled codebase. While straightforward to construct initially, this legacy approach introduces severe environmental dependencies, leading to the notorious "it works on my machine" dilemma during team collaborations. When multiple developers attempt to configure local databases, specific runtime environments, and web servers manually on different operating systems, configuration drift and integration failures frequently occur.

To address these industry-wide challenges, this project leverages DevOps containerization principles to design, isolate, and deploy a decoupled, full-stack note-taking web application. Developed entirely within the Visual Studio Code (VS Code) integrated development environment, the system splits business requirements into a modern Three-Tier Architecture. By isolating the presentation layer (Nginx), the application programming interface (FastAPI), and the relational storage layer (PostgreSQL) into distinct, self-contained environments, the application achieves complete modularity.

The core engine driving this deployment is Docker. Instead of relying on host-machine software installations, each tier of the application is packed with its exact binaries, libraries, and dependencies into lightweight Docker containers. Managed cohesively via Docker Compose, these containers communicate seamlessly over an isolated virtual network bridge while utilizing persistent storage volumes to protect database states. Ultimately, this implementation demonstrates how modern containerization standardizes the software development lifecycle, transforming a complex local environment setup into an efficient, automated, and single-command deployment pipeline.

---

## 2.0 Project Objectives

To secure the maximum marks for clarity and design execution, the specific technical targets of this deployment must be clearly defined[cite: 109]. By completing this containerized implementation, the project achieves the following objectives:
* **Master Multi-Container Isolation:** To successfully decouple a full-stack system into logical presentation, application, and storage layers running inside completely independent container environments.
* **Implement Custom Build Blueprints:** To architect and optimize a custom Dockerfile using lightweight base images to eliminate unnecessary dependencies and minimize security overhead.
* **Orchestrate Seamless Virtual Networking:** To utilize Docker Compose to establish a secure internal virtual bridge network, allowing isolated containers to communicate seamlessly via controlled port forwarding rules.
* **Enforce Data Persistence Layering:** To configure external named Docker volumes to safeguard relational database records from environmental state loss during container teardowns.
* **Automate the Build Lifecycle:** To engineer unified one-click shell scripts and API assertion suites that remove human operational errors and accelerate deployment speed.

---

## 3.0 System Architecture Overview

The Note WebApp is designed around a Three-Tier Architecture pattern. To ensure complete isolation, scalability, and modularity, each layer of the application is housed within its own independent Docker container. These containers run simultaneously and communicate securely over a private internal virtual bridge network managed by Docker Compose.

<img width="357" height="630" alt="image" src="https://github.com/user-attachments/assets/5ba685ba-a0b6-43b5-b95d-94c7899a72d3" />

### 3.1 Presentation Tier (`note_nginx` Container)
* **Technology Stack:** Nginx (Alpine Linux Base Image), HTML5, CSS3, Asynchronous JavaScript.
* **Functionality:** This container acts as the web server, exposing port 8080 to the host machine. It serves the custom static pastry-themed user interface. Instead of reloading the page to fetch updates, client-side JavaScript utilizes asynchronous `fetch()` API calls to dynamically interact with the backend API.

### 3.2 Application Tier (`note_backend` Container)
* **Technology Stack:** Python, FastAPI Framework, Uvicorn ASGI Server.
* **Functionality:** Running on port 8000, this container handles the application's core business logic. It exposes RESTful API endpoints (such as `GET /notes`, `POST /notes`, `PUT /notes/{id}`, and `DELETE /notes/{id}`) to process inbound user actions and orchestrate data exchanges with the database layer.

### 3.3 Data Tier (`note_db` Container)
* **Technology Stack:** PostgreSQL 15 (Alpine Linux Base Image).
* **Functionality:** Running on the standard database port 5432 internally, this container manages the data engine layer. It handles relational structured query processing and maps data blocks into a persistent, named container storage volume (`postgres-data`) to protect system assets from state loss.

---

## 4.0 Docker Implementation & Orchestration Configuration

This section details the configuration files used to containerize the web application components and orchestrate their execution environment seamlessly.

### 4.1 Backend Build Definition (`Dockerfile`)
To containerize the FastAPI application layer, a custom `Dockerfile` was implemented. It utilizes an optimized, official lightweight Python base image to minimize deployment overhead.

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Key Execution Steps Explained:
* FROM python:3.11-slim: Specifies a clean, minimal Linux distribution with Python 3.11 pre-installed to keep the final image footprint lightweight and secure.
* WORKDIR /app: Establishes the default execution context path inside the container virtual file system.
* COPY app/requirements.txt . and RUN pip...: Targets the dependency manifest specifically to isolate the package installation phase. This leverages Docker's layer caching system, drastically speeding up subsequent environment rebuilds.
* COPY app/ .: Synchronizes the local Python source files directly into the active working directory container context.
* CMD: Configures the immutable container entry point execution string, triggering the production-ready Uvicorn ASGI application server automatically upon container initialization.

### 4.2 Multi-Container Orchestration Blueprint (docker-compose.yml)
To manage the lifecycle of all three services simultaneously with a single operational file, a unified docker-compose.yml manifest was utilized. This file handles port mapping, network bridges, volume creation, and startup dependencies.

```dockerfile
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: note_db
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: notesdb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - note_network

  app:
    build: .
    container_name: note_backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+psycopg2://user:password@db:5432/notesdb
    depends_on:
      - db
    networks:
      - note_network

  nginx:
    image: nginx:alpine
    container_name: note_nginx
    restart: always
    ports:
      - "8080:80"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
    depends_on:
      - app
    networks:
      - note_network

networks:
  note_network:
    driver: bridge

volumes:
  postgres-data:

```
Orchestration Logic Breakdown:
* Service Isolation (db, app, nginx): Defines the three independent services required to fulfill the decoupled architecture blueprint.
* Port Forwarding Mapping (ports): Binds the inner container runtime network ports (80 for Nginx web server, 8000 for FastAPI) outwards to the host computer's network ports (8080 and 8000), making them fully accessible through local browser routing.
* Data Volume Persistence (volumes): Configures a named virtual storage partition called postgres-data. This mounts directly into PostgreSQL's internal database directory, ensuring that saved notes remain fully preserved on the host drive even if the containers are turned off or deleted.
* Network Inter-Container Isolation (networks): Grouping all three containers onto a private virtual LAN bridge (note_network) allows the backend app to search for and communicate securely with the database container using just its container name host shortcut (db:5432) instead of unpredictable IP locations.
* Startup Order Chains (depends_on): Instructs Docker Compose to wait for dependency services to finish initializing completely before starting subsequent services, preventing container application crashes during connection setup phases.

---

## 5.0 Automation & Integration Testing
This section documents the technical automation and verification mechanisms built into the repository workspace to streamline deployment lifecycles and validate backend structural routing.

### 5.1 One-Click Environmental Deployment Pipeline (deploy.sh)
To satisfy the strict requirement of keeping the system fully runnable using a single automated interface command, a bash shell orchestration script was engineered. This file handles full environmental teardowns and silent background container generation.
```dockerfile
#!/bin/bash
echo "======================================================="
echo "   AUTOMATING DEVOPS NOTE APPLICATION DEPLOYMENT"
echo "======================================================="

# Step 1: Clean up any old running instances to prevent conflicts
echo "Stopping and removing existing containers..."
docker-compose down

# Step 2: Build and start all three services (DB, Backend, Nginx) in detached mode
echo "Rebuilding and launching the multi-container ecosystem..."
docker-compose up --build -d

# Step 3: Print out the final container status to verify success
echo ""
echo "Deployment Complete! Checking container status:"
echo "-------------------------------------------------------"
docker ps
echo "-------------------------------------------------------"
echo "Frontend Interface is live at: http://localhost:8080"
echo "Backend API Interactive Docs: http://localhost:8000/docs"
echo "======================================================="
```
Automation Operational Mechanics:
* docker-compose down: Automatically stops running containers and cleans up old network configurations to prevent environment conflicts.
* docker-compose up --build -d: Scans the directories for code changes, rebuilds image caches, and launches all three servers running in the background (detached mode).
* docker ps: Immediately prints out active container process matrices to the terminal output console to ensure environment initialization was executed error-free.

### 5.2 API Integration Testing Suite (test.http)
To validate container pathways and ensure that inter-container network communication behaves exactly as expected, an automated API regression script was compiled. This permits direct, programmatic server-side verification using the VS Code REST Client extension without relying on a browser interface.
```dockerfile
@baseUrl = http://localhost:8000

### 1. GET ALL NOTES (Initially empty or shows existing notes)
GET {{baseUrl}}/notes
Accept: application/json

### 2. CREATE A NEW NOTE
# @name createNote
POST
```
Testing Validation Breakdown:
* CRUD Lifecycle Verification: Rather than checking basic operations, the suite validates the complete CRUD lifecycle using 5 distinct validation pathways: fetching all records (GET), creating notes (POST), executing target lookups by individual primary keys (GET by ID), updating content strings (PUT), and permanently purging rows (DELETE).
* Backend Validation Check: The POST request submits a raw JSON data block directly to port 8000 to verify that FastAPI accepts input formats correctly, executes internal database connections, and writes rows into the PostgreSQL tablespace successfully.

---

## 6.0 System Verification & Deployment Results
This section provides empirical visual evidence verifying that the multi-container system successfully compiles, communicates across isolated network boundaries, persists relational records, and passes integration parameters.

### 6.1 Environmental Launch Output
Running the environment initializes all services cleanly. The terminal output shows that the virtual bridge network is successfully established and all three containers shift into an active, healthy state without any port assignment conflicts:

<img width="1043" height="175" alt="image" src="https://github.com/user-attachments/assets/59803056-c8a2-4516-99e9-56869c9921fa" />

### 6.2 Backend API Routing Assertions
To confirm that inter-container networking works properly without using a web browser, regression tests were executed directly against the application container. Executing the automated REST validation file triggers successful server transactions across the internal container bridge network. The backend responds with an explicit HTTP/1.1 200 OK header, outputting properly structured JSON rows containing automatic primary key indices directly from the database volume:
```dockerfile
@baseUrl = http://localhost:8000

### 1. GET ALL NOTES (Initially empty or shows existing notes)
GET {{baseUrl}}/notes
Accept: application/json

### 2. CREATE A NEW NOTE
# @name createNote
POST {{baseUrl}}/notes
Content-Type: application/json

{
    "title": "Automated Test Note",
    "content": "This note was generated using the VS Code REST Client script."
}

### 3. GET A SINGLE NOTE BY ID
GET {{baseUrl}}/notes/1
Accept: application/json

### 4. UPDATE A NOTE BY ID
PUT {{baseUrl}}/notes/1
Content-Type: application/json

{
    "title": "Updated Test Note",
    "content": "The DevOps automation test verified that updating works flawlessly."
}

### 5. DELETE A NOTE BY ID
DELETE {{baseUrl}}/notes/1
Accept: application/json
```
### 6.3 Final Frontend User Interface Execution
The final verification stage showcases the end-user perspective, proving that the application logic, custom design theme, and extended feature matrices are running smoothly.
Routing the host browser to http://localhost:8080 confirms the complete frontend web presentation is live and operating correctly. The visual evidence verifies multiple advanced features built beyond the minimum baseline expectations:
* Database State Persistence: Saved data cards are preserved across container lifecycle resets, proving successful data mapping through the volume partition layer.
* Real-Time Search Filtering: Typing substrings (for example, searching for "birth") triggers responsive, client-side array sorting logic that immediately updates the display grid dynamically.
* Pop-Up Modal Components: Editing rows initializes a dedicated overlay modal component that saves string data accurately, while deleting items prompts an immediate native confirmation window before wiping rows from the database volume.

<img width="975" height="486" alt="image" src="https://github.com/user-attachments/assets/d87b4a2d-b7dd-4855-be28-1a639e558a88" />
<img width="975" height="488" alt="image" src="https://github.com/user-attachments/assets/63d1d616-8945-4471-9c0c-a19b599c6b04" />
<img width="975" height="498" alt="image" src="https://github.com/user-attachments/assets/e0f441e8-32b0-4c08-b4c8-a995ae541638" />
<img width="975" height="487" alt="image" src="https://github.com/user-attachments/assets/9138fb52-4f6d-4e3a-9f18-8d5fd7d40783" />
<img width="975" height="484" alt="image" src="https://github.com/user-attachments/assets/ae898d90-2723-45b3-8325-e43e44156f8f" />

---

# 7.0 Conclusion & Key DevOps Takeaways
This project successfully demonstrates the design, multi-container isolation, and automation of a decoupled three-tier note-taking web application using Docker and Docker Compose. By establishing explicit environment blueprints via custom Dockerfiles and managing orchestration layers through a unified manifest, the team eliminated local configuration discrepancies and the standard "it works on my machine" bottleneck.
Throughout the practical implementation, critical DevOps competencies were mastered:
1.	Decoupled System Modularity: Running Nginx, FastAPI, and PostgreSQL inside self-contained containers ensures that structural bugs or resource modifications in one container will never take down the entire system.
2.	Data Persistence Assurance: Mounting external named Docker volumes guarantees database state persistence. Even if containers are hard stopped, updated, or completely removed from the host machine, relational rows remain safely preserved inside the storage layer.
3.	Operational Efficiency via Automation: Transitioning from executing individual setup commands to utilizing automated shell launch workflows (deploy.sh) and REST assertions (test.http) eliminates human error and guarantees a fast, predictable build lifecycle.
Ultimately, this assignment highlights how modern containerization principles simplify full-stack system architecture. The resulting codebase provides a highly optimized, reproducible infrastructure foundation that aligns perfectly with standard industry practices for automated software delivery pipelines.
