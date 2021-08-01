import express from 'express';
import path from 'path';

const app = express();

app.use('/', express.static(path.join(__dirname, '../client')))

app.listen(parseInt(process.env.PORT, 10) || 8080, process.env.HOST || "0.0.0.0", () => {
    // console.log("Express server started");
});