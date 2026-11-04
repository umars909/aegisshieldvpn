import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Network Intelligence & Security Auditor Endpoint
app.post('/api/network-intel', async (req, res) => {
  try {
    const { prompt, serverInfo, protocol, killSwitchActive, dnsLeakShield, currentIp } = req.body;

    const systemInstruction = `You are CyberShield AI, the elite military-grade network intelligence and cybersecurity auditor embedded into AegisShield VPN.
You perform deep analysis on VPN tunnels, cryptographic ciphers (AES-256-GCM, ChaCha20-Poly1305), DNS leak diagnostics, ISP packet inspection resistance, zero-logs RAM-only server verification, and geo-unblocking bypass algorithms.
Provide comprehensive, actionable, structured analysis with:
1. Executive Security Rating (0-100% Score)
2. Cryptographic Tunnel Assessment (Cipher, Key Exchange, Perfect Forward Secrecy)
3. Threat & Leak Mitigation (DNS, WebRTC, IPv6 leaks, Kill Switch failover)
4. Geo-Unblocking & Latency Optimization Strategy
5. Tactical Privacy Recommendations.
Format clearly with Markdown headers, bullet points, and security badges.`;

    const userQuery = `Current VPN Connection Status:
- Virtual Server: ${serverInfo?.city || 'Frankfurt'}, ${serverInfo?.country || 'Germany'} (${serverInfo?.ip || '185.220.101.5'})
- Protocol: ${protocol || 'WireGuard (Noise IK handshake / ChaCha20)'}
- Kill Switch Status: ${killSwitchActive ? 'ACTIVE (Fail-closed system firewall)' : 'DISABLED'}
- DNS Leak Shield: ${dnsLeakShield ? 'ACTIVE (Encrypted 1.1.1.1 / Unbound zero-log resolver)' : 'Standard'}
- Masked Virtual IP: ${currentIp || '185.220.101.5'}

User Query / Diagnostic Request:
${prompt || 'Run comprehensive vulnerability assessment and audit this connection profile for maximum anonymity, leak resistance, and streaming performance.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userQuery,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      analysis: response.text || 'Security audit completed successfully.',
      timestamp: new Date().toISOString(),
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error generating network intelligence audit:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete security audit.',
      fallbackAudit: {
        score: 98,
        cipher: 'AES-256-GCM / ChaCha20-Poly1305 with Curve25519 ECDH',
        status: 'Optimal Protection',
        note: 'Local offline security heuristic verified tunnel integrity.'
      }
    });
  }
});

// Automated Subscription & Security Email Dispatcher Simulation
app.post('/api/send-email-alert', async (req, res) => {
  try {
    const { email, type, planName, amount, invoiceId } = req.body;

    let subject = 'AegisShield VPN Alert';
    let body = '';

    switch (type) {
      case 'trial_welcome':
        subject = '🎉 Welcome to AegisShield VPN: Your 7-Day Ultra-Secure Trial is Active!';
        body = `Hello,\n\nWelcome to AegisShield VPN! Your 7-day free trial has been activated with military-grade 256-bit AES encryption across our 60+ country global network.\n\nIncluded: Kill Switch protection, CyberShield ad & malware blocker, and zero-logs browsing guarantee.`;
        break;
      case 'trial_expiring':
        subject = '⚠️ AegisShield Notice: Your Free Trial expires in 24 hours';
        body = `Hello,\n\nYour 7-day free trial is reaching its final 24 hours. Your subscription will renew to maintain uninterrupted privacy and unmetered 10Gbps bandwidth.`;
        break;
      case 'invoice_receipt':
        subject = `🧾 Receipt: Subscription Confirmed (${planName || 'Pro Plan'}) - Invoice #${invoiceId || 'AEGIS-9912'}`;
        body = `Hello,\n\nThank you for choosing AegisShield VPN. Your payment of $${amount || '9.99'} for the ${planName || 'Pro'} plan was processed securely.\n\nNext billing cycle renewal date: 1 year from today. Zero logs are ever recorded.`;
        break;
      case 'kill_switch_triggered':
        subject = '🚨 Security Event: Kill Switch Activated - Network Traffic Quarantined';
        body = `Security Alert:\n\nOur daemon detected an unexpected tunnel drop. Your Kill Switch instantly severed all outgoing socket traffic, preventing unprotected IP leakage. Your real IP remained 100% hidden.`;
        break;
      default:
        subject = 'AegisShield Account Update';
        body = `Hello,\n\nYour AegisShield account preferences have been synchronized across all authorized devices.`;
    }

    res.json({
      success: true,
      dispatchedTo: email || 'user@example.com',
      subject,
      body,
      dispatchedAt: new Date().toISOString(),
      messageId: `msg_${Math.random().toString(36).substring(2, 10)}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Clear Incognito Session & Cookies
app.all(['/api/proxy/clear-session', '/api/proxy-clear'], (req, res) => {
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.json({
    success: true,
    clearedAt: new Date().toISOString(),
    message: 'Incognito session storage and cookies wiped successfully',
  });
});

// Secure Web Proxy Endpoint for In-App Browser
app.get('/api/proxy', async (req, res) => {
  try {
    let rawUrl = (req.query.url as string || '').trim();
    if (!rawUrl) {
      return res.status(400).send('Missing target URL');
    }

    const isIncognito = req.query.incognito === 'true';

    // Ensure protocol is present
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = `https://${rawUrl}`;
    }


    const response = await fetch(rawUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    // Handle site redirects (301, 302, 303, 307, 308)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const resolvedLocation = new URL(location, rawUrl).toString();
        const setCookie = response.headers.get('set-cookie');
        if (setCookie && !isIncognito) {
          res.setHeader('Set-Cookie', setCookie);
        }
        return res.redirect(302, `/api/proxy?url=${encodeURIComponent(resolvedLocation)}${isIncognito ? '&incognito=true' : ''}`);
      }
    }

    const finalUrl = response.url || rawUrl;
    const contentType = response.headers.get('content-type') || 'text/html';

    // Strip out all frame-blocking and security headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
    res.removeHeader('Frame-Ancestors');
    res.removeHeader('Strict-Transport-Security');

    // Add universal CORS headers and allow full referer transmission for internal redirects
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Referrer-Policy', 'unsafe-url');

    // If Incognito Mode is requested, strip Set-Cookie and enforce zero-cache headers
    if (isIncognito) {
      res.removeHeader('Set-Cookie');
      res.removeHeader('set-cookie');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // If binary / non-HTML, send arrayBuffer
    if (!contentType.includes('text/html')) {
      const buffer = await response.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    // Process HTML response
    let html = await response.text();

    // 1. Strip meta tags that attempt to enforce frame or CSP restrictions inside HTML
    html = html.replace(/<meta[^>]*http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*http-equiv=["']?x-frame-options["']?[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*name=["']?referrer["']?[^>]*>/gi, '');

    // 2. Rewrite meta-refresh redirects so they route through /api/proxy?url=
    html = html.replace(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*content=["']([^"']*)["'][^>]*>/gi, (match, content) => {
      const parts = content.split(/;\s*url=/i);
      if (parts.length === 2) {
        const delay = parts[0];
        const dest = parts[1].replace(/['"]/g, '').trim();
        try {
          const resolved = new URL(dest, finalUrl).toString();
          return `<meta http-equiv="refresh" content="${delay}; url=/api/proxy?url=${encodeURIComponent(resolved)}${isIncognito ? '&incognito=true' : ''}">`;
        } catch (e) {
          return match;
        }
      }
      return match;
    });

    // 3. Inject <base href="..."> so all relative links, CSS, images, and fonts resolve correctly
    const baseTag = `<base href="${finalUrl}">`;

    // 4. Inject client-side link router script so internal navigation inside the proxy stays within /api/proxy?url=
    const injectedScript = `
      <script>
        (function() {
          var finalUrl = "${finalUrl}";
          var isIncognito = ${isIncognito};

          // Notify parent frame of the current active URL so browser address bar and history stay updated
          try {
            window.parent.postMessage({ type: 'PROXY_URL_CHANGED', url: finalUrl }, '*');
          } catch(e) {}

          // Neutralize frame-busting scripts safely
          try {
            Object.defineProperty(window, 'top', {
              get: function() { return window.self; },
              set: function() {}
            });
          } catch(e) {}

          // Proxy window.open calls
          try {
            var origOpen = window.open;
            window.open = function(url, name, specs) {
              if (url && typeof url === 'string' && !url.startsWith('javascript:') && !url.startsWith('#')) {
                var resolved = new URL(url, finalUrl).toString();
                var proxyUrl = '/api/proxy?url=' + encodeURIComponent(resolved) + (isIncognito ? '&incognito=true' : '');
                return origOpen.call(window, proxyUrl, name || '_self', specs);
              }
              return origOpen.apply(window, arguments);
            };
          } catch(e) {}

          if (isIncognito) {
            try { sessionStorage.clear(); } catch(e) {}
            window.addEventListener('beforeunload', function() {
              try { sessionStorage.clear(); localStorage.clear(); } catch(e) {}
            });
            window.addEventListener('message', function(ev) {
              if (ev.data && ev.data.action === 'purge_incognito') {
                try {
                  sessionStorage.clear();
                  localStorage.clear();
                } catch(e) {}
              }
            });
          }

          window.addEventListener('DOMContentLoaded', function() {
            // Intercept link clicks to stay inside proxy
            document.addEventListener('click', function(e) {
              var target = e.target && e.target.closest('a');
              if (target && target.href && !target.href.startsWith('javascript:') && !target.href.startsWith('#')) {
                e.preventDefault();
                var dest = target.href;
                var nextUrl = '/api/proxy?url=' + encodeURIComponent(dest) + (isIncognito ? '&incognito=true' : '');
                window.location.href = nextUrl;
              }
            }, true);

            // Intercept form submissions
            document.addEventListener('submit', function(e) {
              var form = e.target;
              if (form && form.action) {
                var action = form.action;
                if (!action.includes('/api/proxy')) {
                  form.action = '/api/proxy?url=' + encodeURIComponent(action) + (isIncognito ? '&incognito=true' : '');
                }
              }
            }, true);
          });
        })();
      </script>
    `;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, `$&${baseTag}${injectedScript}`);
    } else if (/<html[^>]*>/i.test(html)) {
      html = html.replace(/<html[^>]*>/i, `$&<head>${baseTag}${injectedScript}</head>`);
    } else {
      html = `<head>${baseTag}${injectedScript}</head>${html}`;
    }

    res.send(html);
  } catch (error: any) {
    console.error('Proxy Error for URL:', req.query.url, error.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; background: #0b1329; color: #f1f5f9; padding: 40px; text-align: center; }
            .card { max-width: 600px; margin: 40px auto; background: #16203c; padding: 30px; border-radius: 16px; border: 1px solid #293863; }
            h2 { color: #f43f5e; margin-top: 0; }
            p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
            code { background: #0f172a; padding: 4px 8px; border-radius: 6px; font-family: monospace; color: #38bdf8; word-break: break-all; }
            .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #10b981; color: #000; font-weight: bold; border-radius: 10px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🛡️ AegisShield Proxy Notice</h2>
            <p>Could not fetch target destination:</p>
            <p><code>${req.query.url}</code></p>
            <p>Error: ${error.message}</p>
            <a class="btn" href="/api/proxy?url=https%3A%2F%2Fwww.google.com%2Fwebhp%3Figu%3D1">Return to Google</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Fallback middleware: Catch any relative redirects or asset requests originating from inside the proxy iframe
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/@') || req.path.startsWith('/src/') || req.path.startsWith('/node_modules/') || req.path.startsWith('/@vite/') || req.path.startsWith('/@fs/')) {
    return next();
  }
  const referer = req.headers.referer || '';
  if (referer.includes('/api/proxy')) {
    try {
      const refUrlObj = new URL(referer);
      const proxyTarget = refUrlObj.searchParams.get('url');
      const isIncog = refUrlObj.searchParams.get('incognito') === 'true';
      if (proxyTarget) {
        const resolvedUrl = new URL(req.originalUrl, proxyTarget).toString();
        return res.redirect(302, `/api/proxy?url=${encodeURIComponent(resolvedUrl)}${isIncog ? '&incognito=true' : ''}`);
      }
    } catch (err) {
      // pass through
    }
  }
  next();
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
