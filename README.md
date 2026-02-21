# Notification Service 🗿

Reliable, asynchronous event delivery system built with Node.js, Express, Prisma and PostgreSQL.

A terminal-first backend service that ingests events and delivers them to subscribed endpoints using asynchronous processing and clear delivery guarantees.

---

## 🚀 Overview

This service simulates a real-world notification/webhook system.

It supports:

* Event ingestion via REST API
* Subscription-based fan-out
* Asynchronous delivery (queue-based)
* Retry with exponential backoff
* At-least-once delivery guarantees
* Idempotency (ingestion + delivery)
* Delivery logging
* Dead Letter Queue (DLQ)

Built as a system design playground for scalability, reliability and failure handling.

---

## 🧱 Architecture

graph TD
A[Producer] --> B[Ingestion API]
B --> C[(PostgreSQL)]
C --> D[Fan-out]
D --> E[DB-backed Queue]
E --> F[Workers]
F --> G[HTTP Target]
G --> H[Log + DLQ]

---

## 🛠 Tech Stack

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL (Docker)

---

## 📦 Core Concepts

### Event

Represents something that happened in the system.

**Example:**

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"type": "user.created", "payload": {"userId": "123"}}'

```

Stored in database with unique ID and timestamp.

### Subscription

Defines which endpoint receives which event types.

### Delivery

Represents a delivery attempt of one event to one subscription.

---

## 🔒 Guarantees

* Delivery model: at-least-once
* Ordering: not guaranteed
* Ingestion idempotency supported
* Delivery deduplication via unique delivery key

---

## 🔁 Retry Strategy

* Exponential backoff
* Configurable max attempts
* Failed deliveries moved to DLQ

---

## 📊 Observability

* /health endpoint
* Delivery logs stored in database
* Metrics-ready architecture

---

## ⚖️ Trade-offs

### DB-backed Queue (MVP)

**Pros**

* Simple setup
* No additional infrastructure

**Cons**

* Limited scalability under high contention

**Future upgrade**

* Replace DB queue with SQS / Kafka / RabbitMQ for high-throughput workloads

---

## 🧪 Local Development

* Start PostgreSQL via Docker
* Run Prisma migrations
* Start the server
* Send events via curl
* Inspect database state

---

## 🎯 Why This Project?

This project explores:

* Event-driven architecture
* Asynchronous system design
* Retry and backoff strategies
* Delivery guarantees
* Horizontal scalability patterns

Designed as preparation for system design interviews and production-grade backend engineering.

