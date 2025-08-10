const express = require("express");
const app = express();

// Simple test endpoint to check if Facebook OAuth redirect works
app.get("/test-facebook", (req, res) => {
  const facebookAuthUrl = "http://localhost:5000/api/auth/facebook";

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Facebook OAuth Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .button { 
          background: #1877F2; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px; 
          display: inline-block;
          margin: 10px 0;
        }
        .info { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>Facebook OAuth Test</h1>
      
      <div class="info">
        <h3>Current Configuration:</h3>
        <p><strong>App ID:</strong> 798034545888164</p>
        <p><strong>Callback URL:</strong> http://localhost:5000/api/auth/facebook/callback</p>
        <p><strong>Frontend URL:</strong> http://localhost:5173</p>
      </div>
      
      <h3>Test Steps:</h3>
      <ol>
        <li>Make sure your backend is running on port 5000</li>
        <li>Click the button below to test Facebook OAuth</li>
        <li>You should be redirected to Facebook login</li>
        <li>After login, you should be redirected back to your frontend</li>
      </ol>
      
      <a href="${facebookAuthUrl}" class="button">Test Facebook Login</a>
      
      <div class="info">
        <h3>If you get errors:</h3>
        <ul>
          <li><strong>"URL Blocked":</strong> Add localhost URLs to Facebook app settings</li>
          <li><strong>"App Not Setup":</strong> Enable Development mode in Facebook app</li>
          <li><strong>"Invalid OAuth":</strong> Check App ID and Secret in .env file</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(
    `Facebook OAuth test server running at http://localhost:${PORT}/test-facebook`
  );
});
