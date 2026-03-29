/** @module main.js – Entry point do HydroBalance Pro */

// ── Styles ────────────────────────────────────────────────
import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/responsive.css';

// ── Modules ───────────────────────────────────────────────
import { calc } from './components/calculator.js';
import { initTabs, goReport } from './components/tabs.js';
import { drawDiagram, downloadDiagram } from './components/diagram.js';
import { loadData, clearAllData, saveData } from './utils/storage.js';
import { El } from './utils/helpers.js';

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[HydroBalance] Inicializando...');

  // 1) Carregar dados salvos ANTES de calcular (async — tenta backend, fallback localStorage)
  await loadData();

  // 2) Calcular com os dados restaurados
  calc();

  // 3) Inicializar navegação por tabs
  initTabs();

  // 4) Event delegation global — captura TODOS os inputs/selects
  //    Salva no localStorage + sync backend em background
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('input[id], select[id]')) {
      calc();
      saveData();
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('select[id]')) {
      calc();
      saveData();
    }
  });

  // 5) Header buttons
  El('btn-hamburger')?.addEventListener('click', toggleSidebar);
  El('sidebar-overlay')?.addEventListener('click', toggleSidebar);
  El('btn-clear')?.addEventListener('click', () => { clearAllData(); calc(); });
  El('btn-excel')?.addEventListener('click', () => {
    import('./components/export-excel.js').then(m => m.exportExcel());
  });
  El('btn-pdf')?.addEventListener('click', () => {
    import('./components/export-pdf.js').then(m => m.exportPDF());
  });
  El('btn-report')?.addEventListener('click', goReport);

  // 6) Diagram buttons
  El('btn-refresh-diagram')?.addEventListener('click', drawDiagram);
  El('btn-dl-diagram')?.addEventListener('click', downloadDiagram);

  // 7) Resize handler
  window.addEventListener('resize', () => {
    const p6 = El('p6');
    if (p6 && p6.classList.contains('on')) drawDiagram();
  });

  console.log('[HydroBalance] Pronto!');
});

// ── Sidebar toggle (mobile) ──────────────────────────────
function toggleSidebar() {
  El('sidebar')?.classList.toggle('open');
  El('sidebar-overlay')?.classList.toggle('open');
}

// ── PWA Service Worker ───────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[HydroBalance] SW registrado:', reg.scope))
      .catch((err) => console.warn('[HydroBalance] SW falhou:', err));
  });
}