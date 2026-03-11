import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma';
import type { Subscription } from '@prisma/client';
import { parseBody } from '../utils';

const router = Router();

async function findSubOr404(id: string, res: Response): Promise<Subscription | null> {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) {
        res.status(404).json({ error: 'Subscription not found' });
        return null;
    }
    return sub;
}

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
    const sub = await findSubOr404(String(req.params.id), res);
    if (!sub) return;
    res.json(sub);
});

router.post('/', async (req: Request, res: Response) => {
    const data = parseBody(res, CreateSubscriptionSchema.safeParse(req.body));
    if (!data) return;

    const sub = await prisma.subscription.create({
        data: { endpoint: data.endpoint, eventTypes: data.eventTypes },
    });
    res.status(201).json(sub);
});

router.patch('/:id', async (req: Request, res: Response) => {
    const data = parseBody(res, UpdateSubscriptionSchema.safeParse(req.body));
    if (!data) return;

    const id = String(req.params.id);
    const existing = await findSubOr404(id, res);
    if (!existing) return;

    const sub = await prisma.subscription.update({
        where: { id },
        data,
    });
    res.json(sub);
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const existing = await findSubOr404(id, res);
    if (!existing) return;
    await prisma.subscription.delete({
        where: { id },
    });
    res.status(204).send();
});

export default router;
