import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Vercel Proxy is running',
    env: {
      hasGasUrl: !!process.env.VITE_GAS_URL,
      useGas: process.env.VITE_USE_GAS
    }
  });
});

// Proxy for GAS to avoid CORS issues
router.post("/gas-proxy", async (req, res) => {
  const { url, body } = req.body;
  
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    console.error('Invalid GAS URL received:', url);
    return res.status(400).json({ status: 'error', message: 'Invalid GAS URL' });
  }

  console.log(`Proxying request to GAS: ${url} (Action: ${body?.action})`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for GAS

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain',
        'User-Agent': 'SIDAPEK-Proxy/1.0'
      },
      body: JSON.stringify(body),
      signal: controller.signal as any
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GAS responded with status ${response.status}:`, errorText);
      return res.status(response.status).json({ 
        status: 'error', 
        message: `Google Apps Script returned error ${response.status}`,
        details: errorText
      });
    }

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      res.json(json);
    } catch (e) {
      console.error('Failed to parse GAS response as JSON. Raw response:', text);
      res.status(500).json({ 
        status: 'error', 
        message: 'GAS response was not valid JSON', 
        details: text.substring(0, 500) // Limit details size
      });
    }
  } catch (error: any) {
    console.error('GAS Proxy Error:', error);
    const isTimeout = error.name === 'AbortError';
    res.status(500).json({ 
      status: 'error', 
      message: isTimeout ? 'Request ke Google Apps Script timeout (60s)' : 'Gagal menghubungi Google Apps Script: ' + error.message 
    });
  }
});

app.use("/api", router);

// Fallback for other API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: `Route ${req.method} ${req.path} not found on Vercel proxy. If you are using Google Sheets mode, ensure VITE_USE_GAS is set to true.` 
  });
});

export default app;
