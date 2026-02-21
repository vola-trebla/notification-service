import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma';

const router = Router();

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

    const event = await prisma.event.create({
        data: {
            type: result.data.type,
            payload: result.data.payload as object,
        },
    });

    res.status(201).json({ message: 'Event saved', event });
});

export default router;