import express from 'express';

const app = express();

const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
];

const products = [
    { id: 1, name: 'Keyboard', price: 49 },
    { id: 2, name: 'Mouse', price: 25 }
];

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express on Kubernetes!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/users', (req, res) => {
    res.json({ data: users });
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find((item) => String(item.id) === req.params.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: user });
});

app.get('/api/products', (req, res) => {
    res.json({ data: products });
});

app.post('/api/echo', (req, res) => {
    if (req.body === undefined) {
        return res.status(400).json({ message: 'A JSON body is required' });
    }

    res.json({ data: req.body });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON body' });
    }

    if (error.type === 'entity.too.large') {
        return res.status(413).json({ message: 'JSON body is too large' });
    }

    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
});

export default app;
