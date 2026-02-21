Notification Service 🗿

Reliable, asynchronous event delivery system built with Node.js, Express, Prisma and PostgreSQL.

A terminal-first backend service that ingests events and delivers them to subscribed endpoints using asynchronous processing and clear delivery guarantees.

⸻

🚀 Overview

This service is designed to simulate a real-world notification/webhook system.

It supports:
•	Event ingestion via REST API
•	Subscription-based fan-out
•	Asynchronous delivery (queue-based)
•	Retry with exponential backoff
•	At-least-once delivery guarantees
•	Idempotency (ingestion + delivery)
•	Delivery logging
•	Dead Letter Queue (DLQ)

Built as a system design playground for scalability, reliability and failure handling.

⸻

🧱 Architecture

Producer (curl / service)
↓
Ingestion API (Express)
↓
PostgreSQL (Events table)
↓
Fan-out
↓
Queue (DB-backed job table for MVP)
↓
Workers
↓
HTTP/Webhook Target
↓
Delivery Log + DLQ


⸻

🛠 Tech Stack
•	Node.js
•	Express
•	Prisma ORM
•	PostgreSQL (Docker)
•	TypeScript

⸻

📦 Core Concepts

Event

Represents something that happened in the system.

Example:

curl -X POST http://localhost:3000/events \
-H "Content-Type: application/json" \
-d '{"type": "user.created", "payload": {"userId": "123"}}'

Stored in database with unique ID and timestamp.

⸻

Subscription

Defines which endpoint receives which event types.

⸻

Delivery

Represents a delivery attempt of one event to one subscription.

⸻

🔒 Guarantees
•	Delivery model: at-least-once
•	Ordering: not guaranteed
•	Ingestion idempotency supported
•	Delivery deduplication via unique delivery key

⸻

🔁 Retry Strategy
•	Exponential backoff
•	Configurable max attempts
•	Failed deliveries moved to DLQ

⸻

📊 Observability
•	/health endpoint
•	Delivery logs in DB
•	Metrics-ready architecture (can integrate Prometheus)

⸻

⚖️ Trade-offs

DB-backed Queue (MVP)

Pros:
•	Simple
•	No extra infrastructure

Cons:
•	Limited scalability under high contention

Future upgrade:
•	SQS / Kafka / RabbitMQ for high-throughput workloads

⸻

🧪 Local Development
1.	Start Postgres via Docker
2.	Run Prisma migrations
3.	Start server
4.	Send events via curl
5.	Inspect database state

⸻

🎯 Why This Project?

This project explores:
•	Asynchronous system design
•	Event-driven architecture
•	Reliability patterns
•	Retry strategies
•	Delivery guarantees
•	Horizontal scalability

Designed as preparation for system design interviews and production-grade backend engineering.

⸻
