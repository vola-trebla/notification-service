import 'dotenv/config';
import express from 'express';
import eventsRouter from './api/routes/events';
import subscriptionsRouter from './api/routes/subscriptions';
import deliveriesRouter from './api/routes/deliveries';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/events', eventsRouter);
app.use('/subscriptions', subscriptionsRouter);
app.use('/deliveries', deliveriesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
