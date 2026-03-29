/** @module components/export-excel – Exportação para Excel */

import { V, fmt, fmtP } from '../utils/helpers.js';
import { getData } from './calculator.js';

export async function exportExcel() {
  // Dynamic import – funciona com CDN ou npm
  let XLSX;
  try {
    XLSX = await import('xlsx');
  } catch {
    // Fallback: CDN global
    XLSX = window.XLSX;
  }
  if (!XLSX) {
    alert('Biblioteca XLSX não disponível. Verifique a instalação.');
    return;
  }

  const d = getData();
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo
  const resumo = [
    ['HYDROBALANCE PRO — BALANÇO HÍDRICO MINERAL', '', '', ''],
    ['Baseado no ICMM Water Reporting Good Practice Guide, 2ª Ed. (2021)', '', '', ''],
    [''],
    ['IDENTIFICAÇÃO DA OPERAÇÃO', '', '', ''],
    ['Nome da Operação', d.nome, 'Empresa', d.emp],
    ['Ano de Referência', d.ano, 'Estado (UF)', d.uf],
    ['Tipologia do Minério', d.tipo, 'Bacia Hidrográfica', d.bacia],
    ['Condição Climática', d.clima, 'Estresse Hídrico', d.est === 'sim' ? 'SIM' : d.est === 'nao' ? 'NÃO' : 'Não avaliado'],
    ['Corpo Receptor Captação', d.capRio, 'Corpo Receptor Lançamento', d.lancRio],
    ['Comitê de Bacia (CBH)', d.cbh, 'Responsável', d.resp],
    [''],
    ['MÉTRICAS ICMM (ML/ANO)', '', '', ''],
    ['Métrica', 'Valor (ML/ano)', 'Nota', ''],
    ['Captação Operacional Total', d.capOp, 'Soma de todas as fontes externas para uso operacional', ''],
    ['OAG – Outra Água Gerenciada', d.oag, 'Dewatering + Desvios de cursos d\'água', ''],
    ['Precipitação + ROM', d.prec + d.rom, 'Chuva captada + umidade natural do minério', ''],
    ['Descarga Total', d.desc, 'Efluentes + OAG devolvida + drenagem externa', ''],
    ['Variação de Estoque (ΔS)', d.ds, 'Positivo = aumento de estoque nos reservatórios', ''],
    ['Consumo Derivado', d.cons, '= Cap.Op.+OAG+Prec.+ROM − Descarga − ΔS', ''],
    ['Reciclo / Reúso Interno', d.rec, 'Volume reutilizado internamente', ''],
    ['Taxa de Reciclo (%)', d.taxa, '= Reciclo / (Reciclo + Cap.Op.) × 100', ''],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(resumo);
  ws1['!cols'] = [{ wch: 36 }, { wch: 18 }, { wch: 36 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo ICMM');

  // Sheet 2: Captação Detalhada
  const cap = [
    ['CAPTAÇÃO OPERACIONAL DETALHADA (ML/ano)', '', ''],
    ['Fonte', 'Qualidade', 'Volume (ML/ano)'],
    ['Água Superficial', 'Alta', V('c-sup-a')],
    ['Água Superficial', 'Baixa', V('c-sup-b')],
    ['Água Subterrânea', 'Alta', V('c-sub-a')],
    ['Água Subterrânea', 'Baixa', V('c-sub-b')],
    ['Água do Mar/Salobre', 'Alta', V('c-mar-a')],
    ['Água do Mar/Salobre', 'Baixa', V('c-mar-b')],
    ['Água de Terceiros', 'Alta', V('c-ter-a')],
    ['Água de Terceiros', 'Baixa', V('c-ter-b')],
    ['Umidade ROM', 'N/A', V('c-rom')],
    ['TOTAL OPERACIONAL', '', d.capOp],
    [''],
    ['OAG – OUTRA ÁGUA GERENCIADA (ML/ano)', '', ''],
    ['Tipo', 'Qualidade', 'Volume (ML/ano)'],
    ['Dewatering / Rebaixamento', 'Alta', V('oag-dew-a')],
    ['Dewatering / Rebaixamento', 'Baixa', V('oag-dew-b')],
    ['Desvio Cursos / Controle Cheias', 'Alta', V('oag-div-a')],
    ['Desvio Cursos / Controle Cheias', 'Baixa', V('oag-div-b')],
    ['TOTAL OAG', '', d.oag],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(cap);
  ws2['!cols'] = [{ wch: 32 }, { wch: 12 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Captação Detalhada');

  // Sheet 3: Descarga e Consumo
  const desc = [
    ['DESCARGA TOTAL (ML/ano)', '', ''],
    ['Destino', 'Qualidade', 'Volume (ML/ano)'],
    ['Corpo d\'água Superficial', 'Alta', V('d-sup-a')],
    ['Corpo d\'água Superficial', 'Baixa', V('d-sup-b')],
    ['Aquífero / Subterrâneo', 'Alta', V('d-sub-a')],
    ['Aquífero / Subterrâneo', 'Baixa', V('d-sub-b')],
    ['Disponibilização a Terceiros', 'Alta', V('d-ter-a')],
    ['Disponibilização a Terceiros', 'Baixa', V('d-ter-b')],
    ['TOTAL DESCARGA', '', d.desc],
    [''],
    ['CONSUMO E EFICIÊNCIA (ML/ano)', '', ''],
    ['Métrica', 'Valor', 'Unidade'],
    ['Variação de Estoque (ΔS)', d.ds, 'ML/ano'],
    ['Consumo Derivado', d.cons, 'ML/ano'],
    ['Reciclo / Reúso Interno', d.rec, 'ML/ano'],
    ['Taxa de Reciclo', d.taxa, '%'],
    ['Evaporação da TSF (componente)', V('con-ev'), 'ML/ano'],
    ['Umidade no Produto (componente)', V('con-prod'), 'ML/ano'],
    ['Umidade no Rejeito/Estéril (componente)', V('con-rej'), 'ML/ano'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(desc);
  ws3['!cols'] = [{ wch: 36 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Descarga e Consumo');

  XLSX.writeFile(wb, `HydroBalance_${d.nome || 'Operacao'}_${d.ano}.xlsx`);
}
