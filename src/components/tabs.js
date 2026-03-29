/** @module components/tabs – Navegação por abas */

import { El } from '../utils/helpers.js';
import { drawDiagram } from './diagram.js';
import { buildReport } from './report.js';

/**
 * Troca a aba ativa
 */
export function switchTab(index) {
  document.querySelectorAll('.ntab').forEach((t, j) => t.classList.toggle('on', index === j));
  document.querySelectorAll('.panel').forEach((p, j) => p.classList.toggle('on', index === j));

  if (index === 6) setTimeout(drawDiagram, 60);
  if (index === 7) buildReport();

  // Fechar sidebar no mobile
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
}

/**
 * Vai direto para o relatório
 */
export function goReport() {
  switchTab(7);
}

/**
 * Inicializa event listeners das tabs
 */
export function initTabs() {
  document.getElementById('nav-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.ntab');
    if (!btn) return;
    const tabIndex = parseInt(btn.dataset.tab);
    if (!isNaN(tabIndex)) switchTab(tabIndex);
  });
}
