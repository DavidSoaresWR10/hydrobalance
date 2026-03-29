/** @module utils/api – Comunicação com o backend HydroBalance */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const checkHealth = () => request('/health');
export const listarOperacoes = () => request('/operacoes');
export const buscarOperacao = (id) => request(`/operacoes/${id}`);
export const criarOperacao = (dados) =>
  request('/operacoes', { method: 'POST', body: JSON.stringify(dados) });
export const atualizarOperacao = (id, dados) =>
  request(`/operacoes/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
export const deletarOperacao = (id) =>
  request(`/operacoes/${id}`, { method: 'DELETE' });
export const salvarBalanco = (operacaoId, dados) =>
  request(`/balanco/${operacaoId}`, { method: 'PUT', body: JSON.stringify(dados) });
export const analisarIA = (messages, model) =>
  request('/ai', { method: 'POST', body: JSON.stringify({ messages, model }) });