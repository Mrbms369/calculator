// src/ui/share.js
// Generates a shareable PNG of the current calculation via <canvas>.
// Uses Web Share API on supported devices, falls back to download.

/**
 * Render a share card to a Blob.
 * @param {object} opts
 * @param {string} opts.expression  e.g. "47 × 89"
 * @param {string|number} opts.result  e.g. "4183"
 * @param {'dark' | 'light'} opts.theme
 * @returns {Promise<Blob>}
 */
export async function generateShareCard({ expression, result, theme = 'dark' }) {
  const W = 800;
  const H = 500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const colors = theme === 'light'
    ? {
        bg:        '#ffffff',
        panel:     '#f7f9fc',
        accent:    '#ff9500',
        text:      '#10131a',
        textDim:   '#666',
        brandBg:   '#0f1115',
        brandText: '#ffffff',
      }
    : {
        bg:        '#0f1115',
        panel:     '#161a22',
        accent:    '#ff9500',
        text:      '#eef1f6',
        textDim:   '#8892a4',
        brandBg:   '#0a0c10',
        brandText: '#ffffff',
      };

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, H);

  // Rounded panel
  const pad = 32;
  roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 20);
  ctx.fillStyle = colors.panel;
  ctx.fill();

  // Top brand strip
  ctx.fillStyle = colors.brandBg;
  roundRect(ctx, pad, pad, W - pad * 2, 60, { tl: 20, tr: 20, br: 0, bl: 0 });
  ctx.fill();

  // Brand text
  ctx.fillStyle = colors.brandText;
  ctx.font = 'bold 22px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('BMs Calculator', pad + 24, pad + 30);

  // Expression (upper right of panel)
  ctx.font = '600 26px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = colors.textDim;
  ctx.textAlign = 'right';
  ctx.fillText(expression, W - pad - 24, 180);

  // Equals sign
  ctx.font = '600 26px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'left';
  ctx.fillText('=', pad + 24, 260);

  // Result (big)
  const resultStr = String(result);
  const fontSize = resultStr.length > 12 ? 56 : resultStr.length > 8 ? 72 : 96;
  ctx.font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(resultStr, W - pad - 24, 300);

  // Footer
  ctx.font = '400 18px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = colors.textDim;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('bms-calculator369.netlify.app', pad + 24, H - pad - 24);

  // Tanzania flag emoji-ish text on the right side of footer
  ctx.textAlign = 'right';
  ctx.fillText('🇹🇿 Made in Tanzania', W - pad - 24, H - pad - 24);

  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}

/**
 * Share or download the given calculation as a PNG.
 * @param {object} opts  see generateShareCard
 * @returns {Promise<'shared' | 'downloaded' | 'cancelled'>}
 */
export async function shareResult(opts) {
  const blob = await generateShareCard(opts);
  const file = new File([blob], `bms-calculator-${Date.now()}.png`, { type: 'image/png' });

  // Preferred: Web Share API with file support
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'BMs Calculator',
        text: `${opts.expression} = ${opts.result}`,
      });
      return 'shared';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
      // Fall through to download
    }
  }

  // Fallback: download the PNG
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}

// ─── Utility ───────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, radius) {
  const r = typeof radius === 'number'
    ? { tl: radius, tr: radius, br: radius, bl: radius }
    : radius;
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}