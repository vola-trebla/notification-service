import { prisma } from '../db/prisma';

const DEFAULT_MAX_ATTEMPTS = 5;

/**
 * Fan-out: create Delivery jobs for all subscriptions that match the event type.
 * Uses deliveryKey (eventId:subscriptionId) for deduplication.
 */
export async function fanOut(eventId: string, eventType: string): Promise<number> {
    const subs = await prisma.subscription.findMany({
        where: {
            active: true,
            eventTypes: { has: eventType },
        },
    });

    let created = 0;
    for (const sub of subs) {
        const deliveryKey = `${eventId}:${sub.id}`;
        const existing = await prisma.delivery.findUnique({
            where: { deliveryKey },
        });
        if (existing) continue;

        await prisma.delivery.create({
            data: {
                eventId,
                subscriptionId: sub.id,
                status: 'pending',
                deliveryKey,
                maxAttempts: DEFAULT_MAX_ATTEMPTS,
            },
        });
        created++;
    }
    return created;
}
