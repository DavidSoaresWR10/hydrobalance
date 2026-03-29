/** @module components/ai-analysis – Análise por IA via proxy backend */

import { V, El, fmt, fmtP } from '../utils/helpers.js';
import { getData } from './calculator.js';

export async function runAI() {
  const d = getData();
  const btn = El('ai-btn');
  const box = El('ai-report-box');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analisando...';
  box.className = 'loading';
  box.textContent = 'A IA está analisando os dados do balanço hídrico...';

  const prompt = `Você é um especialista em gestão hídrica no setor mineral, com profundo conhecimento do ICMM Water Reporting Good Practice Guide (2021), GRI 303, CDP e regulamentação brasileira (CONAMA 357, GT10/IBRAM).

Analise o seguinte balanço hídrico e produza um diagnóstico técnico profissional em português brasileiro:

OPERAÇÃO: ${d.nome} | ${d.emp} | ${d.tipo} | ${d.uf} | Bacia: ${d.bacia}
Ano: ${d.ano} | Clima: ${d.clima} | Estresse hídrico: ${d.est} | CBH: ${d.cbh}

MÉTRICAS (ML/ano):
- Captação Operacional: ${fmt(d.capOp)} ML
  · Superficial Alta: ${fmt(V('c-sup-a'))} | Superficial Baixa: ${fmt(V('c-sup-b'))}
  · Subterrânea Alta: ${fmt(V('c-sub-a'))} | Subterrânea Baixa: ${fmt(V('c-sub-b'))}
  · Terceiros Alta: ${fmt(V('c-ter-a'))} | Terceiros Baixa: ${fmt(V('c-ter-b'))}
  · Umidade ROM: ${fmt(V('c-rom'))}
- OAG (Outra Água Gerenciada): ${fmt(d.oag)} ML
- Precipitação captada: ${fmt(d.prec)} ML
- Descarga Total: ${fmt(d.desc)} ML
- Variação de Estoque ΔS: ${(d.ds >= 0 ? '+' : '') + fmt(d.ds)} ML
- Consumo Derivado: ${fmt(d.cons)} ML
- Reciclo Interno: ${fmt(d.rec)} ML
- Taxa de Reciclo: ${fmtP(d.taxa)}
- Evaporação TSF: ${fmt(V('con-ev'))} ML

Estruture o diagnóstico em 4 seções com títulos em negrito:

**1. Consistência do Balanço**
Avalie se o balanço fecha matematicamente, se os volumes são plausíveis para o tipo de mineração e clima declarado.

**2. Eficiência Hídrica**
Avalie a taxa de reciclo e consumo específico. Compare com benchmarks típicos do setor (mineração de ${d.tipo}).

**3. Riscos Identificados**
Liste riscos hídricos baseados nos dados: estresse hídrico, qualidade das descargas, dependência de fontes específicas.

**4. Recomendações**
Liste 3 a 5 ações concretas para melhorar a gestão e o reporte hídrico, alinhadas ao ICMM e legislação brasileira.

Seja técnico, direto e objetivo. Máximo 450 palavras.`;

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content?.map(b => b.text || '').join('') || 'Resposta não disponível.';
    box.className = '';
    box.innerHTML = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  } catch (e) {
    box.className = '';
    box.innerHTML = '<span style="color:var(--r2)">Erro ao conectar à IA. Verifique sua conexão e tente novamente.</span>';
  }
  btn.disabled = false;
  btn.innerHTML = '↺ Nova Análise IA';
}