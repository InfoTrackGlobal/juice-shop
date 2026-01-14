const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/execute-code', (req, res) => {
  const userCode = req.body.code;

  try {
    const result = eval(userCode);
    res.send(`Execution result: ${result}`);
  } catch (error) {
    res.status(500).send('Error executing code');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));