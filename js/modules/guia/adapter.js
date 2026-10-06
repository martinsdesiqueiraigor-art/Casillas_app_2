// @ts-check
/** @param {import('./types.js').Cycle[]} bank */
export function validateBank(bank) {
 const ids=new Set(),aliases=new Set();
 /** @param {unknown} v */
 const text=v=>typeof v==='string' && v.trim().length>0;
 /** @param {boolean} condition @param {string} message */
 const require= (condition,message)=>{if(!condition)throw new Error(message);};
 require(Array.isArray(bank)&&bank.length>0,'Banco vazio');
 for(const c of bank){
  require(!!c.meta && !!c.contexto && Array.isArray(c.abas),'Estrutura');
  const m=c.meta;
  require(text(m.id)&&!ids.has(m.id),'ID duplicado/vazio');ids.add(m.id);
  require(['fanuc','siemens'].includes(m.controlador),'Controlador');
  require(['torno','centro_de_usinagem'].includes(m.maquina),'Máquina');
  require(text(m.codigo)&&/^(g\d+|cycle\d+)$/.test(m.codigo),'Código');
  require(m.id === [m.controlador,m.maquina,m.codigo].join('_'),'ID canônico');
  require(text(m.titulo)&&Array.isArray(m.tags)&&m.tags.every(text),'Título/tags');
  require(Array.isArray(m.aliases)&&m.aliases.every(text),'Aliases');
  for(const a of m.aliases){require(!aliases.has(a),'Alias ambíguo');aliases.add(a);}
  require(['rosca','furacao'].includes(c.contexto.operacao)&&text(c.contexto.categoriaOriginal),'Operação/categoria');
  const tabs=new Set();
  for(const tab of c.abas){
   require(text(tab.id)&&!tabs.has(tab.id)&&text(tab.titulo),'Aba duplicada/vazia');tabs.add(tab.id);
   require(['acordeon','codigo_comentado','visual_canvas'].includes(tab.tipo),'Tipo de aba');
   if(tab.tipo==='acordeon'){
    require(Array.isArray(tab.acordeoes)&&tab.acordeoes.length>0,'Acordeões');
    const accs=new Set();
    for(const acc of tab.acordeoes||[]){
     require(text(acc.id)&&!accs.has(acc.id)&&text(acc.titulo),'Acordeão duplicado/vazio');accs.add(acc.id);
     require(text(acc.texto)||(Array.isArray(acc.parametros)&&acc.parametros.length>0&&acc.parametros.every(p=>text(p.nome)&&text(p.desc))),'Conteúdo do acordeão');
    }
   }else if(tab.tipo==='codigo_comentado'){
    require(Array.isArray(tab.bloco_gcode)&&tab.bloco_gcode.length>0&&tab.bloco_gcode.every(text)&&Array.isArray(tab.linhas_explicadas),'Código comentado');
    for(const line of tab.linhas_explicadas||[])require(Number.isInteger(line.linha)&&line.linha>=0&&line.linha<(tab.bloco_gcode||[]).length&&text(line.texto),'Explicação');
   }else require(text(tab.descricao),'Visual sem fonte');
  }
  require(c.abas.length>0 && !!c.defaultTarget,'Abas/default');
  const t=c.abas.find(t=>t.id===c.defaultTarget.tabId);
  require(!!t,'Default aba');
  if(c.defaultTarget.accordionId) require(!!t?.acordeoes?.some(a=>a.id===c.defaultTarget.accordionId),'Default acordeão');
 }
 for(const a of aliases)require(!ids.has(a),'Alias colide com ID');
 return true;
}
/** @param {import('./types.js').Cycle} c */
export function toLegacy(c) {
 return {id:c.meta.id,comando:c.meta.controlador==='fanuc'?'Fanuc':'Siemens',
 maquina:c.meta.maquina==='torno'?'Torno':'Centro de Usinagem',codigo:c.meta.codigo.toUpperCase(),
 titulo:c.meta.titulo,categoria:c.contexto.categoriaOriginal,tags:c.meta.tags,
 sintaxe:c.abas[0].acordeoes?.[0].texto||'',parametros:c.abas[0].acordeoes?.[1].parametros||[],
 exemplo:c.abas.find(t=>t.tipo==='codigo_comentado')?.bloco_gcode?.join('\n')||''};
}
