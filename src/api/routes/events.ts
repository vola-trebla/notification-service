import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma';
import { fanOut } from '../../services/fanout';
import { IDEMPOTENCY_TTL_MS } from '../../config';
import { parseBody } from '../utils';

const router = Router();

const EventSchema = z.object({
    type: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
});

router.post('/', async (req: Request, res: Response) => {
    const data = parseBody(res, EventSchema.safeParse(req.body));
    if (!data) return;

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
            type: data.type,
            payload: data.payload as object,
        },
    });

    const deliveryCount = await fanOut(event.id, event.type);

    const response = { message: 'Event saved', event, deliveryCount };
    if (idempotencyKey) {
        const data = { responseBody: response as object, expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS) };
        await prisma.idempotencyKey.upsert({
            where: { key: idempotencyKey },
            create: { key: idempotencyKey, ...data },
            update: data,
        });
    }
    res.status(201).json(response);
});

export default router;
