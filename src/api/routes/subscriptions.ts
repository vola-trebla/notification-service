import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma';

const router = Router();

const CreateSubscriptionSchema = z.object({
    endpoint: z.string().url(),
    eventTypes: z.array(z.string().min(1)).min(1),
});

const UpdateSubscriptionSchema = z.object({
    endpoint: z.string().url().optional(),
    eventTypes: z.array(z.string().min(1)).optional(),
    active: z.boolean().optional(),
});

router.get('/', async (_req: Request, res: Response) => {
    const subscriptions = await prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
    });
    res.json(subscriptions);
});

router.get('/:id', async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const sub = await prisma.subscription.findUnique({
        where: { id },
    });
    if (!sub) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    res.json(sub);
});

router.post('/', async (req: Request, res: Response) => {
    const result = CreateSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues });
        return;
    }

    const sub = await prisma.subscription.create({
        data: {
            endpoint: result.data.endpoint,
            eventTypes: result.data.eventTypes,
        },
    });
    res.status(201).json(sub);
});

router.patch('/:id', async (req: Request, res: Response) => {
    const result = UpdateSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues });
        return;
    }

    const id = String(req.params.id);
    const existing = await prisma.subscription.findUnique({
        where: { id },
    });
    if (!existing) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }

    const sub = await prisma.subscription.update({
        where: { id },
        data: result.data,
    });
    res.json(sub);
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const existing = await prisma.subscription.findUnique({
        where: { id },
    });
    if (!existing) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    await prisma.subscription.delete({
        where: { id },
    });
    res.status(204).send();
});

export default router;
