import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma';
import { fanOut } from '../../services/fanout';

const router = Router();

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const EventSchema = z.object({
    type: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
});

router.post('/', async (req: Request, res: Response) => {
    const result = EventSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ error: result.error.issues });
        return;
    }

    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    if (idempotencyKey) {
        const cached = await prisma.idempotencyKey.findUnique({
            where: { key: idempotencyKey },
        });
        if (cached && new Date(cached.expiresAt) > new Date()) {
            res.status(201).json(cached.responseBody as object);
            return;
        }
    }

    const event = await prisma.event.create({
        data: {
            type: result.data.type,
            payload: result.data.payload as object,
        },
    });

    const deliveryCount = await fanOut(event.id, event.type);

    const response = { message: 'Event saved', event, deliveryCount };

    if (idempotencyKey) {
        await prisma.idempotencyKey.upsert({
            where: { key: idempotencyKey },
            create: {
                key: idempotencyKey,
                responseBody: response as object,
                expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
            },
            update: {
                responseBody: response as object,
                expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
            },
        });
    }

    res.status(201).json(response);
});

export default router;
