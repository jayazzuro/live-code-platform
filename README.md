# Live Code Execution Backend

Backend system for a **Live Code Execution feature** designed for an AI-enabled Job Simulation Platform.

This service allows learners to write code, autosave changes, execute code asynchronously, and retrieve execution results.

The system is designed to be **secure, scalable, and non-blocking** using a **queue-based worker architecture**.

---

# 1. Architecture Overview

The system follows a **queue-based asynchronous execution model**.

Components:

API Server (Node.js + Express)  
Handles session creation, autosave, and execution requests.

Redis Queue (Bull)  
Manages background execution jobs.

Worker Service  
Processes execution jobs and runs user code.

Database (PostgreSQL / SQLite via Prisma)  
Stores sessions and execution results.

```
Client
│
│ HTTP Request
▼
API Server
│
│ Push Job
▼
Redis Queue
│
▼
Worker
│
│ Execute Code
▼
Database
│
▼
Client polls execution result
```

---

# 2. Features

Supported capabilities:

- Create live coding sessions
- Autosave code changes
- Execute code asynchronously
- Retrieve execution results
- Track execution lifecycle
- Queue-based worker processing

Execution states:

```
QUEUED → RUNNING → COMPLETED / FAILED
```

---

# 3. Tech Stack

Backend:

- Node.js
- Express.js

Queue System:

- Redis
- Bull Queue

Database:

- PostgreSQL / SQLite
- Prisma ORM

Infrastructure:

- Docker
- Docker Compose

---

# 4. Project Structure

```
src
│
├── controller
│   └── codeSession.controller.js
│   └── executions.controller.js
│
├── routes
│   └── codeSession.routes.js
│   └── executions.routes.js
│
├── workers
│   └── execution.worker.js
│
├── config
│   ├── prisma.js
│   └── queue.js
│   └── viewEngine.js
│
└── server.js
└── worker.js
```

Separation of concerns:

API Layer  
Handles HTTP requests and responses.

Queue Producer  
Adds execution jobs to Redis queue.

Worker  
Processes jobs and runs code execution.

Database Layer  
Manages sessions and execution records.

---

# 5. API Documentation

## 5.1 Create Code Session

POST /code-sessions

Creates a new live coding session.

Response

```json
{
  "session_id": "uuid",
  "status": "ACTIVE"
}
```

---

## 5.2 Autosave Code

PATCH /code-sessions/{session_id}

Autosaves the current source code.

Request

```json
{
  "language": "python",
  "source_code": "print('Hello World')"
}
```

Response

```json
{
  "session_id": "uuid",
  "status": "ACTIVE"
}
```

---

## 5.3 Execute Code

POST /code-sessions/{session_id}/run

Runs code asynchronously.

The API returns immediately while the worker processes the job in background.

Response

```json
{
  "execution_id": "uuid",
  "status": "QUEUED"
}
```

---

## 5.4 Get Execution Result

GET /executions/{execution_id}

Retrieve execution status and output.

Possible states:

- QUEUED
- RUNNING
- COMPLETED
- FAILED

Example response

```json
{
  "execution_id": "uuid",
  "status": "COMPLETED",
  "stdout": "Hello World\n",
  "stderr": "",
  "execution_time_ms": 22
}
```

---

# 6. Execution Flow

1. Client creates a code session
2. Client writes code and autosaves periodically
3. Client sends run request
4. API creates execution record
5. API pushes job to Redis queue
6. Worker processes job
7. Worker executes code
8. Worker updates execution result
9. Client polls result using execution_id

---

# 7. Execution Worker

The worker processes execution jobs from the Redis queue.

Lifecycle:

```
QUEUED
↓
RUNNING
↓
COMPLETED / FAILED
```

Example execution:

```python
print("Hello World")
```

Result:

```
stdout: Hello World
execution_time_ms: 22
```

---

# 8. Observability

Execution lifecycle is logged in database.

Execution states tracked:

- QUEUED
- RUNNING
- COMPLETED
- FAILED

Each execution stores:

- stdout
- stderr
- execution_time_ms
- timestamps

---

# 9. Safety Considerations

Basic protections implemented:

- asynchronous execution
- queue-based processing
- lifecycle tracking
- error capture

Future improvements could include:

- execution timeout protection
- memory limits
- sandbox execution using Docker
- language restrictions

---

# 10. Scalability Considerations

The system can scale by:

Horizontal scaling of workers

```
Worker 1
Worker 2
Worker 3
```

All workers consume jobs from the same Redis queue.

Advantages:

- Non-blocking API
- High concurrency
- Fault tolerance

---

# 11. Trade-offs

Design decisions:

Queue-based execution was chosen to prevent blocking API requests.

Redis + Bull was selected because it provides:

- job retries
- lifecycle tracking
- queue monitoring

Trade-offs:

Current implementation executes code directly on host environment.

In production environments, code execution should run inside sandbox containers.

---

# 12. Future Improvements

With more time, the system could include:

- Execution sandbox (Docker container per run)
- Timeout protection
- Memory usage limits
- Multi-language support
- Rate limiting
- Worker auto-scaling

---

# 13. Running the Project

Requirements

- Docker
- Docker Compose

Start services

```bash
docker-compose up
```

This will start:

- API server
- Redis queue
- Worker service

---

# 14. Testing Example

Create session

```
POST /code-sessions
```

Run code

```
POST /code-sessions/{session_id}/run
```

Get result

```
GET /executions/{execution_id}
```

Example output:

```json
{
  "status": "COMPLETED",
  "stdout": "Hello World",
  "execution_time_ms": 22
}
```
