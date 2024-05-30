import app from './Config/Server.js';

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
