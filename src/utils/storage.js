/** @module utils/storage – Persistência localStorage + backend */

import { criarOperacao, atualizarOperacao, salvarBalanco, buscarOperacao } from './api.js';

const STORAGE_KEY = 'hydrobalance_data_v2';
const OP_ID_KEY = 'hydrobalance_operacao_id';
let saveTimeout = null;
let syncTimeout = null;

function getAllFieldIds() {
  const elements = document.querySelectorAll('input[id], select[id]');
  return Array.from(elements).map(el => el.id).filter(id => id && !id.endsWith('-calc'));
}

export function getOperacaoId() {
  return localStorage.getItem(OP_ID_KEY) || null;
}

export function setOperacaoId(id) {
  if (id) localStorage.setItem(OP_ID_KEY, id);
  else localStorage.removeItem(OP_ID_KEY);
}

function getPerfilData() {
  const el = (id) => document.getElementById(id)?.value?.trim() || '';
  return {
    nome: el('p-nome'), empresa: el('p-emp'),
    ano: parseInt(el('p-ano')) || new Date().getFullYear(),
    uf: el('p-uf'), bacia: el('p-bacia'), tipo_minerio: el('p-tipo'),
    clima: el('p-clima'), estresse_hidrico: el('p-estresse'),
    metodo_lavra: el('p-lavra'), corpo_captacao: el('p-capt-rio'),
    corpo_lancamento: el('p-lanc-rio'), cbh: el('p-cbh'), responsavel: el('p-resp'),
  };
}

function getBalancoData() {
  const v = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const t = (id) => document.getElementById(id)?.value?.trim() || '';
  return {
    c_sup_a: v('c-sup-a'), c_sup_b: v('c-sup-b'),
    c_sub_a: v('c-sub-a'), c_sub_b: v('c-sub-b'),
    c_mar_a: v('c-mar-a'), c_mar_b: v('c-mar-b'),
    c_ter_a: v('c-ter-a'), c_ter_b: v('c-ter-b'), c_rom: v('c-rom'),
    oag_dew_a: v('oag-dew-a'), oag_dew_b: v('oag-dew-b'),
    oag_div_a: v('oag-div-a'), oag_div_b: v('oag-div-b'),
    prec_a: v('prec-a'), prec_b: v('prec-b'),
    prec_fonte: t('prec-fonte'), prec_mm: v('prec-mm'),
    d_sup_a: v('d-sup-a'), d_sup_b: v('d-sup-b'),
    d_sub_a: v('d-sub-a'), d_sub_b: v('d-sub-b'),
    d_ter_a: v('d-ter-a'), d_ter_b: v('d-ter-b'), d_sup_nome: t('d-sup-nome'),
    ds: v('ds'), rec: v('rec'),
    con_ev: v('con-ev'), con_prod: v('con-prod'), con_rej: v('con-rej'),
    tec1: v('tec1'), tec2: v('tec2'),
  };
}

function fillFromBackend(operacao, balanco) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val != null) el.value = val;
  };
  set('p-nome', operacao.nome); set('p-emp', operacao.empresa);
  set('p-ano', operacao.ano); set('p-uf', operacao.uf);
  set('p-bacia', operacao.bacia); set('p-tipo', operacao.tipo_minerio);
  set('p-clima', operacao.clima); set('p-estresse', operacao.estresse_hidrico);
  set('p-lavra', operacao.metodo_lavra); set('p-capt-rio', operacao.corpo_captacao);
  set('p-lanc-rio', operacao.corpo_lancamento);
  set('p-cbh', operacao.cbh); set('p-resp', operacao.responsavel);
  if (!balanco) return;
  set('c-sup-a', balanco.c_sup_a); set('c-sup-b', balanco.c_sup_b);
  set('c-sub-a', balanco.c_sub_a); set('c-sub-b', balanco.c_sub_b);
  set('c-mar-a', balanco.c_mar_a); set('c-mar-b', balanco.c_mar_b);
  set('c-ter-a', balanco.c_ter_a); set('c-ter-b', balanco.c_ter_b);
  set('c-rom', balanco.c_rom);
  set('oag-dew-a', balanco.oag_dew_a); set('oag-dew-b', balanco.oag_dew_b);
  set('oag-div-a', balanco.oag_div_a); set('oag-div-b', balanco.oag_div_b);
  set('prec-a', balanco.prec_a); set('prec-b', balanco.prec_b);
  set('prec-fonte', balanco.prec_fonte); set('prec-mm', balanco.prec_mm);
  set('d-sup-a', balanco.d_sup_a); set('d-sup-b', balanco.d_sup_b);
  set('d-sub-a', balanco.d_sub_a); set('d-sub-b', balanco.d_sub_b);
  set('d-ter-a', balanco.d_ter_a); set('d-ter-b', balanco.d_ter_b);
  set('d-sup-nome', balanco.d_sup_nome);
  set('ds', balanco.ds); set('rec', balanco.rec);
  set('con-ev', balanco.con_ev); set('con-prod', balanco.con_prod);
  set('con-rej', balanco.con_rej);
  set('tec1', balanco.tec1); set('tec2', balanco.tec2);
}

function syncToBackend() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const opId = getOperacaoId();
      if (opId) {
        await atualizarOperacao(opId, getPerfilData());
        await salvarBalanco(opId, getBalancoData());
        console.log('[HydroBalance] Sync backend OK');
      } else {
        const perfil = getPerfilData();
        if (!perfil.nome) return;
        const op = await criarOperacao(perfil);
        setOperacaoId(op.id);
        await salvarBalanco(op.id, getBalancoData());
        console.log('[HydroBalance] Nova operação criada:', op.id);
      }
    } catch (e) {
      console.warn('[HydroBalance] Sync backend falhou (offline?):', e.message);
    }
  }, 2000);
}

export function saveData() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const data = {};
      getAllFieldIds().forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value;
      });
      data.__timestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      showSaveStatus('saved');
    } catch (e) {
      console.warn('[HydroBalance] Erro ao salvar localStorage:', e);
    }
  }, 300);
  syncToBackend();
}

export async function loadData() {
  const opId = getOperacaoId();
  if (opId) {
    try {
      const { operacao, balanco } = await buscarOperacao(opId);
      fillFromBackend(operacao, balanco);
      showSaveStatus('loaded', 'servidor');
      console.log('[HydroBalance] Dados carregados do backend');
      return true;
    } catch (e) {
      console.warn('[HydroBalance] Backend indisponível, usando localStorage:', e.message);
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { showSaveStatus('new'); return false; }
    const data = JSON.parse(raw);
    let restored = 0;
    Object.entries(data).forEach(([id, val]) => {
      if (id.startsWith('__')) return;
      const el = document.getElementById(id);
      if (el) { el.value = val; restored++; }
    });
    console.log(`[HydroBalance] ${restored} campos restaurados do localStorage`);
    if (data.__timestamp) {
      const when = new Date(data.__timestamp);
      const timeStr = when.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dateStr = when.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      showSaveStatus('loaded', `${dateStr} ${timeStr}`);
    } else { showSaveStatus('loaded'); }
    return true;
  } catch (e) {
    console.warn('[HydroBalance] Erro ao carregar:', e);
    showSaveStatus('error');
    return false;
  }
}

export function clearAllData() {
  if (!confirm('Deseja limpar TODOS os dados preenchidos?\nEsta ação não pode ser desfeita.')) return;
  localStorage.removeItem(STORAGE_KEY);
  setOperacaoId(null);
  getAllFieldIds().forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else if (el.type === 'number') el.value = '0';
    else el.value = '';
  });
  const anoEl = document.getElementById('p-ano');
  if (anoEl) anoEl.value = new Date().getFullYear();
  showSaveStatus('cleared');
}

function showSaveStatus(status, extra = '') {
  const ind = document.getElementById('save-ind');
  const txt = document.getElementById('save-txt');
  if (!ind || !txt) return;
  ind.classList.remove('saved');
  switch (status) {
    case 'saved':
      ind.classList.add('saved');
      txt.textContent = '✓ Salvo';
      setTimeout(() => {
        ind.classList.remove('saved');
        txt.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }, 1800);
      break;
    case 'loaded': txt.textContent = extra ? `↻ ${extra}` : '↻ Restaurado'; break;
    case 'new': txt.textContent = 'Novo'; break;
    case 'cleared': txt.textContent = '🗑 Limpo'; break;
    case 'error': txt.textContent = '⚠ Erro'; break;
  }
}