import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const EventSchema = z.object({
    type: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
});

router.post('/', (req: Request, res: Response) => {
    const result = EventSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ error: result.error.flatten() });
        return;
    }

    const event = result.data;
    console.log('Received event:', event);

    res.status(201).json({ message: 'Event received', event });
});

export default router;
