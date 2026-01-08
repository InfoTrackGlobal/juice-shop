const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const app = express();

const csrfProtection = csrf({ cookie: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/update-email', csrfProtection, (req, res) => {
  // Render the form with the CSRF token
  res.send(`
    <form action="/update-email" method="POST">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <label for="email">New Email:</label>
      <input type="email" name="email" id="email" required>
      <button type="submit">Update Email</button>
    </form>
  `);
});

app.post('/update-email', csrfProtection, (req, res) => {
  const newEmail = req.body.email;
  const userId = req.session.userId; // Assume user is authenticated

  // Update user's email in the database
  // db.updateUserEmail(userId, newEmail);

  res.send('Email updated successfully');
});

app.listen(3000, () => console.log('Server running on port 3000'));