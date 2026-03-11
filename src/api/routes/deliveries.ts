import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const where = status ? { status } : {};
    const deliveries = await prisma.delivery.findMany({
        where,
        include: { event: true, subscription: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });
    res.json(deliveries);
});

router.get('/dlq', async (_req: Request, res: Response) => {
    const dlq = await prisma.delivery.findMany({
        where: { status: 'dlq' },
        include: { event: true, subscription: true, logs: true },
        orderBy: { updatedAt: 'desc' },
    });
    res.json(dlq);
});

router.get('/:id', async (req: Request, res: Response) => {
    const delivery = await prisma.delivery.findUnique({
        where: { id: req.params.id },
        include: { event: true, subscription: true, logs: true },
    });
    if (!delivery) {
        res.status(404).json({ error: 'Delivery not found' });
        return;
    }
    res.json(delivery);
});

export default router;
