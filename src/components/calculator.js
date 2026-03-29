/** @module components/calculator – Motor de cálculo do balanço hídrico */

import { V, El, fmt, fmtP, setV } from '../utils/helpers.js';
import { saveData } from '../utils/storage.js';

/**
 * Recalcula todo o balanço hídrico e atualiza a UI
 */
export function calc() {
  const capOp = V('c-sup-a') + V('c-sup-b') + V('c-sub-a') + V('c-sub-b') +
                V('c-mar-a') + V('c-mar-b') + V('c-ter-a') + V('c-ter-b');
  const oag   = V('oag-dew-a') + V('oag-dew-b') + V('oag-div-a') + V('oag-div-b');
  const prec  = V('prec-a') + V('prec-b');
  const rom   = V('c-rom');
  const desc  = V('d-sup-a') + V('d-sup-b') + V('d-sub-a') + V('d-sub-b') +
                V('d-ter-a') + V('d-ter-b');
  const ds    = V('ds');
  const rec   = V('rec');
  const cons  = capOp + oag + prec + rom - desc - ds;
  const taxa  = capOp > 0 ? rec / (rec + capOp) * 100 : 0;

  // Campos derivados
  setV('cons-calc', cons.toFixed(1));
  setV('taxa-calc', taxa.toFixed(1));

  // Equação live
  const eqC = El('eq-c');
  if (eqC) {
    eqC.textContent = fmt(capOp);
    El('eq-o').textContent = fmt(oag);
    El('eq-p').textContent = fmt(prec);
    El('eq-r').textContent = fmt(rom);
    El('eq-d').textContent = fmt(desc);
    El('eq-s').textContent = fmt(ds);
    El('eq-res').textContent = fmt(cons) + ' ML/ano';
  }

  // Sidebar
  El('sb-cap').textContent  = fmt(capOp + oag);
  El('sb-desc').textContent = fmt(desc);
  El('sb-cons').textContent = fmt(cons);
  El('sb-rec').textContent  = fmt(rec);
  El('sb-ds').textContent   = fmt(ds);
  El('sb-taxa').textContent = capOp > 0 ? fmtP(taxa) : '—';
  El('prog-cap').textContent  = fmt(capOp) + ' ML';
  El('prog-oag').textContent  = fmt(oag) + ' ML';
  El('prog-prec').textContent = fmt(prec) + ' ML';
  El('prog-rom').textContent  = fmt(rom) + ' ML';

  // Status pill
  const pill = El('status-pill');
  const total = capOp + oag + prec + rom;
  if (total === 0 && desc === 0) {
    pill.className = 'status-pill sp-idle';
    pill.innerHTML = '<span class="sp-icon">⚡</span><div class="sp-txt"><strong>Aguardando dados</strong>Preencha os volumes</div>';
  } else if (cons < 0) {
    pill.className = 'status-pill sp-err';
    pill.innerHTML = '<span class="sp-icon">⚠️</span><div class="sp-txt"><strong>Balanço Negativo</strong>Descarga maior que entradas. Verifique ΔS.</div>';
  } else if (total > 0 && cons / total > 0.8) {
    pill.className = 'status-pill sp-warn';
    pill.innerHTML = `<span class="sp-icon">🔍</span><div class="sp-txt"><strong>Consumo Elevado</strong>${fmtP(cons / total * 100)} da entrada. Revise evaporação e ΔS.</div>`;
  } else {
    pill.className = 'status-pill sp-ok';
    pill.innerHTML = `<span class="sp-icon">✅</span><div class="sp-txt"><strong>Balanço Consistente</strong>${fmt(cons)} ML/ano (${fmtP(total > 0 ? cons / total * 100 : 0)} da entrada)</div>`;
  }

  // Salvar automaticamente
  saveData();
}

/**
 * Coleta todos os dados para exportação/relatório
 */
export function getData() {
  const capOp = V('c-sup-a') + V('c-sup-b') + V('c-sub-a') + V('c-sub-b') +
                V('c-mar-a') + V('c-mar-b') + V('c-ter-a') + V('c-ter-b');
  const oag   = V('oag-dew-a') + V('oag-dew-b') + V('oag-div-a') + V('oag-div-b');
  const prec  = V('prec-a') + V('prec-b');
  const rom   = V('c-rom');
  const desc  = V('d-sup-a') + V('d-sup-b') + V('d-sub-a') + V('d-sub-b') +
                V('d-ter-a') + V('d-ter-b');
  const ds    = V('ds');
  const rec   = V('rec');
  const cons  = capOp + oag + prec + rom - desc - ds;
  const taxa  = capOp > 0 ? rec / (rec + capOp) * 100 : 0;

  return {
    capOp, oag, prec, rom, desc, ds, rec, cons, taxa,
    nome: El('p-nome')?.value?.trim() || '—',
    emp: El('p-emp')?.value?.trim() || '—',
    ano: El('p-ano')?.value?.trim() || '—',
    bacia: El('p-bacia')?.value?.trim() || '—',
    tipo: El('p-tipo')?.value,
    uf: El('p-uf')?.value,
    clima: El('p-clima')?.value,
    est: El('p-estresse')?.value,
    resp: El('p-resp')?.value?.trim() || '—',
    cbh: El('p-cbh')?.value?.trim() || '—',
    capRio: El('p-capt-rio')?.value?.trim() || '—',
    lancRio: El('p-lanc-rio')?.value?.trim() || '—',
  };
}
