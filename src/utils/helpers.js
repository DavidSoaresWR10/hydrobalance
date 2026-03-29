/** @module utils/helpers – Funções auxiliares do HydroBalance */

export const El = (id) => document.getElementById(id);

export const V = (id) => {
  const el = El(id);
  return el ? (parseFloat(el.value) || 0) : 0;
};

export const setV = (id, v) => {
  const e = El(id);
  if (e) e.value = v;
};

export const txt = (id) => El(id)?.value?.trim() || '—';

export const fmt = (n) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtP = (n) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
