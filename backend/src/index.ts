import express from 'express';

const app = express();
const port = 3001; // フロントエンド(3000)と被らないようにする

app.get('/', (req, res) => {
  res.send('Hello from Kuhn Poker Backend!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});