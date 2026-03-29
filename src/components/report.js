/** @module components/report – Geração do relatório consolidado */

import { V, El, fmt, fmtP } from '../utils/helpers.js';
import { getData } from './calculator.js';

export function buildReport() {
  const d = getData();
  El('rpt-body').innerHTML = `
  <div class="rpt-header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
      <div>
        <div style="font-size:.63rem;letter-spacing:.1em;color:var(--c5);text-transform:uppercase;margin-bottom:.35rem">Relatório de Balanço Hídrico · ICMM 2021 · GT10/IBRAM</div>
        <div style="font-family:'Fraunces',serif;font-size:1.5rem;line-height:1.1">${d.nome}</div>
        <div style="font-size:.82rem;color:var(--c6);margin-top:.3rem">${d.emp} &nbsp;·&nbsp; ${d.uf} &nbsp;·&nbsp; ${d.tipo}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,.4);margin-top:.2rem">Bacia: ${d.bacia} &nbsp;·&nbsp; Captação: ${d.capRio} &nbsp;·&nbsp; Lançamento: ${d.lancRio}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:.7rem;color:var(--c5)">Ano de Referência</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:2rem;font-weight:500;line-height:1">${d.ano}</div>
        <div style="font-size:.68rem;color:rgba(255,255,255,.4)">CBH: ${d.cbh} · Resp.: ${d.resp}</div>
        <div style="font-size:.68rem;color:${d.est === 'sim' ? '#f07060' : 'rgba(255,255,255,.4)'}">Estresse hídrico: ${d.est === 'sim' ? '⚠ SIM' : d.est === 'nao' ? 'Não' : 'Não avaliado'}</div>
      </div>
    </div>
    <div class="rpt-kpi-grid">
      ${[['Captação Op.', fmt(d.capOp), 'ML/ano', 'var(--c5)'],
         ['OAG', fmt(d.oag), 'ML/ano', '#e8a060'],
         ['Descarga Total', fmt(d.desc), 'ML/ano', '#f07060'],
         ['Consumo', fmt(d.cons), 'ML/ano', '#ffd166'],
         ['Reciclo', fmt(d.rec), 'ML/ano', '#60d090'],
         ['Taxa Reciclo', fmtP(d.taxa), 'do processado', '#60d090'],
         ['Precipit.+ROM', fmt(d.prec + d.rom), 'ML/ano', 'var(--c6)'],
         ['ΔS Estoque', (d.ds >= 0 ? '+' : '') + fmt(d.ds), 'ML/ano', '#c090ff']
        ].map(([l, v, u, c]) => `
      <div class="kpi-box">
        <div class="kpi-l" style="color:${c}">${l}</div>
        <div class="kpi-v" style="color:${c}">${v}</div>
        <div class="kpi-u">${u}</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="rpt-grid">
    <div class="card">
      <div class="card-head"><span class="ico">💧</span>Captação Operacional por Fonte</div>
      <table class="rtable">
        <thead><tr><th>Fonte</th><th>Qualidade</th><th>ML/ano</th></tr></thead>
        <tbody>
          ${[['Superficial', V('c-sup-a'), 'a'], ['Superficial', V('c-sup-b'), 'b'],
             ['Subterrânea', V('c-sub-a'), 'a'], ['Subterrânea', V('c-sub-b'), 'b'],
             ['Água do Mar', V('c-mar-a'), 'a'], ['Água do Mar', V('c-mar-b'), 'b'],
             ['Terceiros', V('c-ter-a'), 'a'], ['Terceiros', V('c-ter-b'), 'b'],
             ['Umidade ROM', V('c-rom'), 'o'],
            ].map(([n, v, q]) => `<tr><td>${n}</td><td><span class="tag tag-${q}">${q === 'a' ? 'ALTA' : q === 'b' ? 'BAIXA' : 'ROM'}</span></td><td>${fmt(v)}</td></tr>`).join('')}
        </tbody>
        <tfoot><tr><td colspan="2">TOTAL OPERACIONAL</td><td>${fmt(d.capOp)}</td></tr></tfoot>
      </table>
    </div>

    <div class="card">
      <div class="card-head"><span class="ico">🔁</span>OAG & Precipitação</div>
      <table class="rtable">
        <thead><tr><th>Tipo</th><th>Qual.</th><th>ML/ano</th></tr></thead>
        <tbody>
          ${[['Dewatering', V('oag-dew-a'), 'a'], ['Dewatering', V('oag-dew-b'), 'b'],
             ['Desvio/Cheias', V('oag-div-a'), 'a'], ['Desvio/Cheias', V('oag-div-b'), 'b'],
            ].map(([n, v, q]) => `<tr><td>${n}</td><td><span class="tag tag-o">OAG</span><span class="tag tag-${q}" style="margin-left:3px">${q === 'a' ? 'ALTA' : 'BAIXA'}</span></td><td>${fmt(v)}</td></tr>`).join('')}
        </tbody>
        <tfoot><tr><td colspan="2">TOTAL OAG</td><td>${fmt(d.oag)}</td></tr></tfoot>
      </table>
      <table class="rtable" style="margin-top:.65rem">
        <thead><tr><th>Precipitação</th><th>Qual.</th><th>ML/ano</th></tr></thead>
        <tbody>
          <tr><td>Chuva direta</td><td><span class="tag tag-a">ALTA</span></td><td>${fmt(V('prec-a'))}</td></tr>
          <tr><td>Escoamento contato</td><td><span class="tag tag-b">BAIXA</span></td><td>${fmt(V('prec-b'))}</td></tr>
        </tbody>
        <tfoot><tr><td colspan="2">TOTAL PRECIPIT.</td><td>${fmt(d.prec)}</td></tr></tfoot>
      </table>
    </div>

    <div class="card">
      <div class="card-head"><span class="ico">🏞️</span>Descarga por Destino</div>
      <table class="rtable">
        <thead><tr><th>Destino</th><th>Qual.</th><th>ML/ano</th></tr></thead>
        <tbody>
          ${[['Superficial', V('d-sup-a'), 'a'], ['Superficial', V('d-sup-b'), 'b'],
             ['Subterrâneo', V('d-sub-a'), 'a'], ['Subterrâneo', V('d-sub-b'), 'b'],
             ['Terceiros', V('d-ter-a'), 'a'], ['Terceiros', V('d-ter-b'), 'b'],
            ].map(([n, v, q]) => `<tr><td>${n}</td><td><span class="tag tag-${q}">${q === 'a' ? 'ALTA' : 'BAIXA'}</span></td><td>${fmt(v)}</td></tr>`).join('')}
        </tbody>
        <tfoot><tr><td colspan="2">TOTAL DESCARGA</td><td>${fmt(d.desc)}</td></tr></tfoot>
      </table>
    </div>

    <div class="card">
      <div class="card-head"><span class="ico">📊</span>Consumo & Eficiência Hídrica</div>
      <table class="rtable">
        <thead><tr><th>Métrica ICMM</th><th>ML/ano</th></tr></thead>
        <tbody>
          <tr><td>Captação Operacional</td><td>${fmt(d.capOp)}</td></tr>
          <tr><td>OAG Captada</td><td>${fmt(d.oag)}</td></tr>
          <tr><td>Precipitação + ROM</td><td>${fmt(d.prec + d.rom)}</td></tr>
          <tr><td>Descarga Total</td><td>${fmt(d.desc)}</td></tr>
          <tr><td>ΔS (Variação de Estoque)</td><td>${(d.ds >= 0 ? '+' : '') + fmt(d.ds)}</td></tr>
          <tr style="background:var(--a3)"><td><strong>Consumo Derivado</strong></td><td><strong>${fmt(d.cons)}</strong></td></tr>
          <tr><td>Reciclo Interno</td><td>${fmt(d.rec)}</td></tr>
          <tr style="background:var(--g3)"><td><strong>Taxa de Reciclo</strong></td><td><strong>${fmtP(d.taxa)}</strong></td></tr>
          <tr><td>Evap. TSF (componente)</td><td>${fmt(V('con-ev'))}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="card" style="margin-top:1rem">
    <div class="card-head"><span class="ico">⚖️</span>Equação do Balanço Verificada</div>
    <div class="eq-block">
Consumo = Cap.Op.(${fmt(d.capOp)}) + OAG(${fmt(d.oag)}) + Precip.(${fmt(d.prec)}) + ROM(${fmt(d.rom)}) − Desc.(${fmt(d.desc)}) − ΔS(${fmt(d.ds)})
Consumo = <span class="highlight">${fmt(d.cons)} ML/ano</span>
Taxa de Reciclo = ${fmt(d.rec)} / (${fmt(d.rec)} + ${fmt(d.capOp)}) × 100 = <span class="highlight">${fmtP(d.taxa)}</span>
    </div>
    <div style="font-size:.73rem;color:var(--muted);margin-top:.5rem;line-height:1.7">
      Referências: ICMM Water Reporting Good Practice Guide, 2ª Ed. (2021) · GRI 303: Water and Effluents (2018) · GT10/IBRAM (2026) · CONAMA 357/2005
    </div>
  </div>

  <div class="card" style="margin-top:1rem">
    <div class="card-head">
      <span class="ico">🤖</span>Análise por Inteligência Artificial
      <span class="ai-badge">✦ IA</span>
      <button class="btn btn-purple" style="margin-left:auto;font-size:.75rem" id="ai-btn">
        ✦ Gerar Análise IA
      </button>
    </div>
    <div class="info" style="margin-bottom:.75rem">A IA analisa os dados preenchidos e gera um diagnóstico técnico: consistência do balanço, eficiência hídrica, riscos e recomendações — em linguagem adequada para relatório ICMM/GRI.</div>
    <div id="ai-report-box">Clique em "Gerar Análise IA" para obter um diagnóstico automático do balanço hídrico preenchido.</div>
  </div>

  <div class="btn-row">
    <button class="btn btn-green" id="rpt-btn-excel">📊 Exportar Excel</button>
    <button class="btn btn-blue" id="rpt-btn-pdf">📄 Exportar PDF</button>
    <button class="btn btn-ghost" id="rpt-btn-print">🖨 Imprimir</button>
  </div>`;

  // Re-attach event listeners for buttons inside report
  El('ai-btn')?.addEventListener('click', () => {
    import('./ai-analysis.js').then(m => m.runAI());
  });
  El('rpt-btn-excel')?.addEventListener('click', () => {
    import('./export-excel.js').then(m => m.exportExcel());
  });
  El('rpt-btn-pdf')?.addEventListener('click', () => {
    import('./export-pdf.js').then(m => m.exportPDF());
  });
  El('rpt-btn-print')?.addEventListener('click', () => window.print());
}
