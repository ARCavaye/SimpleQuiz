# SimpleQuiz

SimpleQuiz is a full-stack quiz application for medical education. It allows users to ingest questions, manage a question bank, take quizzes, and review results with analytics. The project uses a Django backend, React frontend (Material UI), and is fully containerized with Docker and Docker Compose.

## Features
- **Question Ingestion:** Upload and manage quiz questions.
- **Quiz Interface:** Take quizzes with immediate feedback and correct answer highlighting.
- **Results Summary:** Review quiz history and analytics by category.
- **Question Manager:** Edit and delete questions in the bank.
- **REST API:** Backend endpoints for all quiz operations.
- **PostgreSQL Database:** Persistent storage for all data.
- **Dockerized:** Easy deployment and orchestration with Docker Compose.

## Project Structure
```
SimpleQuiz/
├── backend/           # Django backend
│   ├── src/           # Django project source
│   └── .env           # Backend environment variables
├── frontend/          # React frontend (Material UI)
│   └── Dockerfile     # Frontend Dockerfile
├── docker-compose.yml # Orchestration for backend, frontend, and db
├── Dockerfile         # Backend Dockerfile
├── requirements.txt   # Python dependencies
└── README.md          # This file
```

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Quick Start
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd SimpleQuiz
   ```
2. **Build and start all services:**
   ```sh
   docker compose up --build
   ```
3. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000/api/](http://localhost:8000/api/)
   - PostgreSQL: localhost:5432 (user: simplequizuser, pass: simplequizpass)

4. **Apply migrations (if needed):**
   ```sh
   docker compose exec backend python manage.py migrate
   ```

### Adding Questions

Questions can be added via the Question Manager. Questions should be provided in JSON format:
```JSON
[
  {
    "question_text": "What is the capital of France?",
    "answer_a": "Paris",
    "answer_b": "London",
    "answer_c": "Berlin",
    "answer_d": "Madrid",
    "correct_answer": "A",
    "hint": "It's known as the city of lights.",
    "category": "Geography",
    "difficulty": "easy"
  }
]
```
Multiple questions can be provided as a list of JSON objects.

## Environment Variables
- Backend variables are set in `backend/.env` and passed to the backend container.
- Default database credentials:
  - POSTGRES_DB=simplequiz
  - POSTGRES_USER=simplequizuser
  - POSTGRES_PASSWORD=simplequizpass
  - POSTGRES_HOST=db
  - POSTGRES_PORT=5432

## Development
- **Backend:**
  - Located in `backend/src/`
  - Uses Django REST Framework
  - To run locally (without Docker):
    ```sh
    cd backend/src
    pip install -r ../requirements.txt
    python manage.py runserver
    ```
- **Frontend:**
  - Located in `frontend/`
  - Uses React and Material UI
  - To run locally (without Docker):
    ```sh
    cd frontend
    npm install
    npm start
    ```

## API Endpoints
- `/api/questions/ingest/` - Ingest questions
- `/api/quizzes/generate/` - Generate a quiz
- `/api/quizzes/{id}/answer/` - Submit an answer
- `/api/quizzes/{id}/results/` - Get quiz results

## License
MIT

---
For more details, see `specification.md`.
