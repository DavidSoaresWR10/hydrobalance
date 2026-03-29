/** @module components/export-pdf – Exportação para PDF */

import { V, fmt, fmtP } from '../utils/helpers.js';
import { getData } from './calculator.js';

export async function exportPDF() {
  // Dynamic import
  let jsPDF;
  try {
    const mod = await import('jspdf');
    jsPDF = mod.jsPDF;
    await import('jspdf-autotable');
  } catch {
    jsPDF = window.jspdf?.jsPDF;
  }
  if (!jsPDF) {
    alert('Biblioteca jsPDF não disponível. Verifique a instalação.');
    return;
  }

  const d = getData();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210, M = 15, CW = PW - M * 2;

  // header bg
  doc.setFillColor(11, 31, 56);
  doc.rect(0, 0, PW, 38, 'F');
  doc.setTextColor(91, 163, 245);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  doc.text('HYDROBALANCE PRO · BALANÇO HÍDRICO MINERAL · ICMM 2021', PW / 2, 9, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(d.nome, PW / 2, 18, { align: 'center' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.setTextColor(168, 208, 255);
  doc.text(`${d.emp} · ${d.tipo} · ${d.uf} · Bacia: ${d.bacia}`, PW / 2, 25, { align: 'center' });
  doc.text(`Ano de referência: ${d.ano}`, PW / 2, 31, { align: 'center' });

  let y = 46;

  // KPI boxes
  const kpis = [
    ['Captação Op.', fmt(d.capOp) + ' ML', '0b4a8a'],
    ['OAG', fmt(d.oag) + ' ML', '7a4000'],
    ['Descarga Total', fmt(d.desc) + ' ML', '8b1a10'],
    ['Consumo', fmt(d.cons) + ' ML', '7a5500'],
    ['Reciclo', fmt(d.rec) + ' ML', '0d5c2e'],
    ['Taxa Reciclo', fmtP(d.taxa), '0d5c2e'],
  ];
  const bw = (CW - 5 * 4) / 6;
  kpis.forEach((k, i) => {
    const bx = M + i * (bw + 4);
    const [r1, g1, b1] = [parseInt(k[2].slice(0, 2), 16), parseInt(k[2].slice(2, 4), 16), parseInt(k[2].slice(4, 6), 16)];
    doc.setFillColor(r1 + 80, g1 + 80, b1 + 80);
    doc.roundedRect(bx, y, bw, 14, 1.5, 1.5, 'F');
    doc.setTextColor(r1, g1, b1); doc.setFontSize(5.5); doc.setFont('helvetica', 'bold');
    doc.text(k[0], bx + bw / 2, y + 5, { align: 'center' });
    doc.setFontSize(7); doc.text(k[1], bx + bw / 2, y + 11, { align: 'center' });
  });
  y += 20;

  // Tables
  const tableHead = { fillColor: [11, 31, 56], textColor: [91, 163, 245], fontSize: 8, fontStyle: 'bold' };
  const tableBody = { fontSize: 7.5 };
  const tableAlt = { fillColor: [244, 241, 236] };

  doc.autoTable({
    startY: y, margin: { left: M, right: M },
    head: [['Captação Operacional — Fonte', 'Qualidade', 'ML/ano']],
    body: [
      ['Água Superficial', 'ALTA', fmt(V('c-sup-a'))], ['Água Superficial', 'BAIXA', fmt(V('c-sup-b'))],
      ['Água Subterrânea', 'ALTA', fmt(V('c-sub-a'))], ['Água Subterrânea', 'BAIXA', fmt(V('c-sub-b'))],
      ['Água do Mar', 'ALTA', fmt(V('c-mar-a'))], ['Água do Mar', 'BAIXA', fmt(V('c-mar-b'))],
      ['Terceiros', 'ALTA', fmt(V('c-ter-a'))], ['Terceiros', 'BAIXA', fmt(V('c-ter-b'))],
      ['Umidade ROM', '—', fmt(V('c-rom'))],
      ['TOTAL OPERACIONAL', '', fmt(d.capOp)],
    ],
    headStyles: tableHead, bodyStyles: tableBody, alternateRowStyles: tableAlt,
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Consumo + equação
  doc.autoTable({
    startY: y, margin: { left: M, right: M },
    head: [['Métrica', 'ML/ano']],
    body: [
      ['Captação Operacional', fmt(d.capOp)],
      ['OAG Captada', fmt(d.oag)],
      ['Precipitação + ROM', fmt(d.prec + d.rom)],
      ['Descarga Total', fmt(d.desc)],
      ['Variação de Estoque (ΔS)', (d.ds >= 0 ? '+' : '') + fmt(d.ds)],
      ['CONSUMO DERIVADO', fmt(d.cons)],
      ['Reciclo Interno', fmt(d.rec)],
      ['TAXA DE RECICLO', fmtP(d.taxa)],
    ],
    headStyles: tableHead, bodyStyles: tableBody, alternateRowStyles: tableAlt,
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // equation box
  doc.setFillColor(5, 14, 26);
  doc.roundedRect(M, y, CW, 20, 2, 2, 'F');
  doc.setTextColor(91, 163, 245); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text('EQUAÇÃO DO BALANÇO HÍDRICO', M + 4, y + 6);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(168, 208, 255);
  doc.text(`Consumo = ${fmt(d.capOp)}(Cap) + ${fmt(d.oag)}(OAG) + ${fmt(d.prec)}(Prec) + ${fmt(d.rom)}(ROM) − ${fmt(d.desc)}(Desc) − ${fmt(d.ds)}(ΔS) = ${fmt(d.cons)} ML/ano`, M + 4, y + 12);
  doc.setTextColor(255, 209, 102); doc.setFont('helvetica', 'bold');
  doc.text(`Taxa de Reciclo: ${fmtP(d.taxa)}  ·  Responsável: ${d.resp}`, M + 4, y + 18);

  y += 26;
  doc.setFillColor(230, 230, 230); doc.rect(M, y, CW, 0.3, 'F');
  y += 4;
  doc.setTextColor(130, 130, 130); doc.setFontSize(6); doc.setFont('helvetica', 'normal');
  doc.text('HydroBalance Pro · Baseado no ICMM Water Reporting Good Practice Guide, 2ª Ed. (2021) · GRI 303 · GT10/IBRAM (2026) · CONAMA 357/2005', PW / 2, y, { align: 'center' });

  doc.save(`HydroBalance_${d.nome || 'Operacao'}_${d.ano}.pdf`);
}
