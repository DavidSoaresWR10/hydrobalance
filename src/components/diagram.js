/** @module components/diagram – Diagrama de fluxo hídrico em Canvas */

import { V, El, fmt } from '../utils/helpers.js';

export function drawDiagram() {
  const canvas = El('dcanvas');
  if (!canvas) return;
  const W = canvas.parentElement.offsetWidth - 40;
  canvas.width = W;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  const capOp = V('c-sup-a') + V('c-sup-b') + V('c-sub-a') + V('c-sub-b') +
                V('c-mar-a') + V('c-mar-b') + V('c-ter-a') + V('c-ter-b');
  const oag   = V('oag-dew-a') + V('oag-dew-b') + V('oag-div-a') + V('oag-div-b');
  const prec  = V('prec-a') + V('prec-b');
  const rom   = V('c-rom');
  const desc  = V('d-sup-a') + V('d-sup-b') + V('d-sub-a') + V('d-sub-b') +
                V('d-ter-a') + V('d-ter-b');
  const rec   = V('rec');
  const ds    = V('ds');
  const cons  = capOp + oag + prec + rom - desc - ds;
  const taxa  = capOp > 0 ? rec / (rec + capOp) * 100 : 0;

  const H = 480, cx = W / 2, cy = H / 2, NW = 130, NH = 48;

  // bg
  const grd = ctx.createLinearGradient(0, 0, 0, 480);
  grd.addColorStop(0, '#050e1a');
  grd.addColorStop(1, '#0b1f38');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, 480);

  function rr(x, y, w, h, r, f, s, lw = 1.5) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (f) { ctx.fillStyle = f; ctx.fill(); }
    if (s) { ctx.strokeStyle = s; ctx.lineWidth = lw; ctx.stroke(); }
  }

  function node(x, y, line1, line2, bg, border) {
    rr(x - NW / 2, y - NH / 2, NW, NH, 7, bg, border);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10.5px IBM Plex Mono,monospace'; ctx.textAlign = 'center';
    ctx.fillText(line1, x, line2 ? y - 4 : y + 4);
    if (line2) {
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.font = '9px IBM Plex Sans,sans-serif';
      ctx.fillText(line2, x, y + 10);
    }
  }

  function arrow(x1, y1, x2, y2, col, label, val, cx_off = 0, cy_off = 0) {
    const active = val !== 0 && val !== undefined;
    ctx.save();
    ctx.globalAlpha = active ? 1 : .2;
    ctx.strokeStyle = col; ctx.lineWidth = active ? 2.2 : 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(ang - .4), y2 - 9 * Math.sin(ang - .4));
    ctx.lineTo(x2 - 9 * Math.cos(ang + .4), y2 - 9 * Math.sin(ang + .4));
    ctx.closePath(); ctx.fill();
    if (label && active) {
      const mx = (x1 + x2) / 2 + cx_off, my = (y1 + y2) / 2 + cy_off;
      ctx.globalAlpha = 1;
      rr(mx - 36, my - 14, 72, 22, 4, 'rgba(5,14,26,.88)', col, 1);
      ctx.fillStyle = col; ctx.font = 'bold 9px IBM Plex Mono,monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, mx, my - 3);
      ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.font = '8px IBM Plex Mono,monospace';
      ctx.fillText(fmt(val) + ' ML', mx, my + 8);
    }
    ctx.restore();
  }

  // site boundary
  ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = '#1b4f9e'; ctx.lineWidth = 1.5; ctx.globalAlpha = .5;
  rr(W * .28, 55, W * .44, 375, 12, null, '#1b4f9e');
  ctx.restore();
  ctx.fillStyle = '#3278d4'; ctx.font = '600 9.5px IBM Plex Sans,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('— LIMITE DO SÍTIO —', W * .5, 47);

  // central nodes
  node(cx, cy - 72, 'PLANTA DE', 'PROCESSAMENTO', '#103060', '#3278d4');
  node(cx, cy + 72, 'BARRAGEM DE', 'REJEITOS (TSF)', '#0f2744', '#3278d4');

  // sources left
  const lx = W * .12;
  node(lx, H * .2, 'SUPERFICIAL', null, '#082040', '#5ba3f5');
  node(lx, H * .37, 'SUBTERRÂNEA', null, '#082040', '#5ba3f5');
  node(lx, H * .54, 'OAG / DEWATER.', null, '#2a1600', '#e07b1a');
  node(lx, H * .71, 'TERCEIROS / ROM', null, '#082040', '#5ba3f5');

  // outputs right
  const rx = W * .88;
  node(rx, H * .3, 'DESCARGA ETE', '→ Rio', '#1a0505', '#d63b2b');
  node(rx, H * .5, 'DESCARGA OAG', 'Excedente', '#1a0505', '#d63b2b');
  node(rx, H * .7, 'EVAPORAÇÃO', 'Consumo TSF', '#1a0a00', '#e07b1a');

  // precip top
  node(cx, 28, 'PRECIPITAÇÃO', null, '#04141f', '#5ba3f5');

  // arrows in
  arrow(lx + NW / 2, H * .2, cx - NW / 2, cy - 72, '#5ba3f5', 'Sup.Capt.', V('c-sup-a') + V('c-sup-b'));
  arrow(lx + NW / 2, H * .37, cx - NW / 2, cy - 72, '#5ba3f5', 'Sub.Capt.', V('c-sub-a') + V('c-sub-b'));
  arrow(lx + NW / 2, H * .54, cx - NW / 2, cy + 72, '#e07b1a', 'OAG', oag);
  arrow(lx + NW / 2, H * .71, cx - NW / 2, cy - 72, '#5ba3f5', 'Terceiros+ROM', V('c-ter-a') + V('c-ter-b') + rom);
  arrow(cx, 50, cx, cy - 72 - NH / 2, '#5ba3f5', 'Precipit.', prec, 30, 0);

  // arrows out
  arrow(cx + NW / 2, cy - 72, rx - NW / 2, H * .3, '#d63b2b', 'Desc.Op.', V('d-sup-a') + V('d-sup-b') + V('d-sub-a') + V('d-sub-b'));
  arrow(cx + NW / 2, cy + 72, rx - NW / 2, H * .5, '#d63b2b', 'OAG desc.', oag > 0 ? oag * .5 : 0);
  arrow(cx, cy + 72 + NH / 2, rx - NW / 2, H * .7, '#e07b1a', 'Evap.', V('con-ev'));

  // recycle arc
  if (rec > 0) {
    ctx.save(); ctx.strokeStyle = '#18a158'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    const rx1 = cx + NW / 2 + 6;
    ctx.moveTo(rx1, cy + 72);
    ctx.bezierCurveTo(rx1 + 60, cy + 72, rx1 + 60, cy - 72, rx1, cy - 72);
    ctx.stroke();
    ctx.fillStyle = '#18a158'; ctx.beginPath();
    ctx.moveTo(rx1, cy - 72);
    ctx.lineTo(rx1 + 9, cy - 62);
    ctx.lineTo(rx1 - 9, cy - 62);
    ctx.closePath(); ctx.fill();
    rr(rx1 + 8, cy - 12, 88, 26, 5, 'rgba(5,14,26,.9)', '#18a158', 1);
    ctx.fillStyle = '#18a158'; ctx.font = 'bold 9px IBM Plex Mono,monospace'; ctx.textAlign = 'left';
    ctx.fillText('RECICLO', rx1 + 14, cy + 1);
    ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.font = '8px IBM Plex Mono,monospace';
    ctx.fillText(fmt(rec) + ' ML', rx1 + 14, cy + 12);
    ctx.restore();
  }

  // ΔS indicator
  if (ds !== 0) {
    rr(cx - 50, H - 52, 100, 28, 6, 'rgba(139,77,204,.2)', '#8b4dcc', 1);
    ctx.fillStyle = '#8b4dcc'; ctx.font = 'bold 10px IBM Plex Mono,monospace'; ctx.textAlign = 'center';
    ctx.fillText('ΔS ' + (ds > 0 ? '+' : '') + fmt(ds) + ' ML', cx, H - 33);
  }

  // result box
  rr(cx - 115, H - 92, 230, 34, 8, '#103060', '#3278d4', 2);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 11.5px IBM Plex Mono,monospace'; ctx.textAlign = 'center';
  ctx.fillText('CONSUMO = ' + fmt(cons) + ' ML/ano', cx, H - 69);

  // taxa badge
  if (capOp > 0) {
    rr(W - 116, H - 55, 108, 40, 8, '#0d5c2e', '#18a158', 1.5);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px IBM Plex Sans,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TAXA DE RECICLO', W - 62, H - 39);
    ctx.fillStyle = '#c8f5de'; ctx.font = 'bold 13px IBM Plex Mono,monospace';
    ctx.fillText(taxa.toFixed(1) + '%', W - 62, H - 21);
  }
}

export function downloadDiagram() {
  drawDiagram();
  const a = document.createElement('a');
  a.download = 'HydroBalance_Diagrama.png';
  a.href = El('dcanvas').toDataURL('image/png');
  a.click();
}
