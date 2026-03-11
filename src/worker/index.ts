import 'dotenv/config';
import { prisma } from '../db/prisma';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_MS) || 1000;
const BASE_BACKOFF_MS = Number(process.env.BACKOFF_BASE_MS) || 1000;
const MAX_ATTEMPTS = Number(process.env.DELIVERY_MAX_ATTEMPTS) || 5;

function backoffMs(attempt: number): number {
    return BASE_BACKOFF_MS * Math.pow(2, attempt);
}

async function deliverOne(delivery: {
    id: string;
    eventId: string;
    subscriptionId: string;
    attempts: number;
    maxAttempts: number;
}) {
    const [event, sub] = await Promise.all([
        prisma.event.findUniqueOrThrow({ where: { id: delivery.eventId } }),
        prisma.subscription.findUniqueOrThrow({ where: { id: delivery.subscriptionId } }),
    ]);

    const body = JSON.stringify({
        type: event.type,
        payload: event.payload,
        eventId: event.id,
        timestamp: event.createdAt.toISOString(),
    });

    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let error: string | null = null;

    try {
        const res = await fetch(sub.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            signal: AbortSignal.timeout(30_000),
        });
        statusCode = res.status;
        responseBody = (await res.text()).slice(0, 1000);

        if (res.ok) {
            await prisma.$transaction([
                prisma.delivery.update({
                    where: { id: delivery.id },
                    data: { status: 'delivered', attempts: delivery.attempts + 1, updatedAt: new Date() },
                }),
                prisma.deliveryLog.create({
                    data: {
                        deliveryId: delivery.id,
                        attemptNum: delivery.attempts + 1,
                        status: 'success',
                        statusCode,
                        responseBody,
                    },
                }),
            ]);
            return;
        }
        error = `HTTP ${statusCode}`;
    } catch (e) {
        error = e instanceof Error ? e.message : String(e);
    }

    const nextAttempt = delivery.attempts + 1;
    const isFinal = nextAttempt >= delivery.maxAttempts;

    await prisma.$transaction([
        prisma.delivery.update({
            where: { id: delivery.id },
            data: {
                status: isFinal ? 'dlq' : 'pending',
                attempts: nextAttempt,
                nextRetryAt: isFinal ? null : new Date(Date.now() + backoffMs(nextAttempt)),
                updatedAt: new Date(),
            },
        }),
        prisma.deliveryLog.create({
            data: {
                deliveryId: delivery.id,
                attemptNum: nextAttempt,
                status: 'failure',
                statusCode,
                responseBody,
                error,
            },
        }),
    ]);
}

async function runWorker() {
    const now = new Date();
    const pending = await prisma.delivery.findMany({
        where: {
            status: 'pending',
            OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
        },
        take: 10,
        orderBy: { createdAt: 'asc' },
    });

    for (const d of pending) {
        try {
            await deliverOne(d);
        } catch (e) {
            console.error(`Worker error for delivery ${d.id}:`, e);
        }
    }
}

async function main() {
    console.log('Worker started. Poll interval:', POLL_INTERVAL_MS, 'ms');
    while (true) {
        try {
            await runWorker();
        } catch (e) {
            console.error('Worker loop error:', e);
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
}

main();
