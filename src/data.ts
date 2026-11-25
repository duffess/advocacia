// Escritório fictício para demonstração. Troque tudo pelos dados reais do cliente.
export const FIRM = {
  name: 'Laranjeira Vaz',
  full: 'Laranjeira Vaz Advogados',
  oab: 'OAB/SP 00.000 (registro fictício)',
  address: 'Rua Exemplo, 100, 8º andar · Jardins, São Paulo',
  hours: 'Segunda a sexta, das 9h às 19h',
  phone: '(11) 0000-0000',
  email: 'contato@exemplo.adv.br',
  whatsapp: '5511900000000',
};

export function waLink(message: string): string {
  return `https://wa.me/${FIRM.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const areas = [
  {
    word: 'Empresarial',
    lead: 'Contratos, sociedades e o dia a dia jurídico de quem tem uma empresa.',
    items: ['Contratos e negociações', 'Acordo de sócios e entrada ou saída de sócio', 'Holding e reorganização societária', 'Cobrança e recuperação de crédito'],
  },
  {
    word: 'Família',
    lead: 'Decisões que mexem com a vida inteira, conduzidas com calma e discrição.',
    items: ['Divórcio judicial e em cartório', 'Guarda e convivência', 'Pensão alimentícia', 'Pacto antenupcial e união estável'],
  },
  {
    word: 'Sucessões',
    lead: 'Planejar a herança antes, para que a família não precise brigar depois.',
    items: ['Inventário judicial e em cartório', 'Testamento', 'Planejamento sucessório', 'Doação com reserva de usufruto'],
  },
  {
    word: 'Imobiliário',
    lead: 'Compra, venda e locação com cada cláusula lida antes da assinatura.',
    items: ['Análise de matrícula e documentos', 'Contratos de compra e venda', 'Locação comercial e residencial', 'Regularização de imóvel'],
  },
];

export const method = [
  { t: 'Escuta', p: 'A primeira conversa é para entender o que aconteceu, sem pressa e sem jargão.' },
  { t: 'Diagnóstico', p: 'Mostramos por escrito os caminhos possíveis, os riscos de cada um e o tempo esperado.' },
  { t: 'Estratégia', p: 'Você decide o caminho com a gente. Nada é feito sem o seu de acordo.' },
  { t: 'Acompanhamento', p: 'Um advogado responsável pelo seu caso, com retorno combinado e relatórios claros.' },
];

export const team = [
  { name: 'Helena Laranjeira', role: 'Sócia · Família e Sucessões', initials: 'HL' },
  { name: 'Rafael Vaz', role: 'Sócio · Empresarial', initials: 'RV' },
  { name: 'Marina Okada', role: 'Advogada · Imobiliário', initials: 'MO' },
  { name: 'Tiago Brandão', role: 'Advogado · Contratos', initials: 'TB' },
  { name: 'Lúcia Pires', role: 'Advogada · Sucessões', initials: 'LP' },
  { name: 'André Sales', role: 'Advogado · Societário', initials: 'AS' },
];

export const notes = [
  { tag: 'Família', title: 'Divórcio em cartório: quando é possível e o que levar', date: 'Out 2026', min: 4 },
  { tag: 'Sucessões', title: 'Inventário: por que o prazo de 60 dias importa', date: 'Set 2026', min: 5 },
  { tag: 'Empresarial', title: 'Acordo de sócios: cinco cláusulas que evitam brigas', date: 'Ago 2026', min: 6 },
];
