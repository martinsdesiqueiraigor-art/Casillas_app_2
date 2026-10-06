// @ts-check
/** @param {string} tag @param {string} text */
function el(tag,text=''){const node=document.createElement(tag);node.textContent=text;return node;}
/** @param {import('../types.js').Tab} tab */
export function renderBlock(tab){
 const panel=el('section');panel.dataset.tabId=tab.id;
 if(tab.tipo==='acordeon'){
  for(const acc of tab.acordeoes||[]){
   const details=document.createElement('details');details.dataset.accordionId=acc.id;
   details.append(el('summary',acc.titulo));
   if(acc.texto)details.append(el('pre',acc.texto));
   if(acc.parametros){const list=el('ul');for(const p of acc.parametros)list.append(el('li',p.nome+' - '+p.desc));details.append(list);}
   panel.append(details);
  }
 }else if(tab.tipo==='codigo_comentado'){
  panel.append(el('pre',(tab.bloco_gcode||[]).join('\n')));
  for(const line of tab.linhas_explicadas||[])panel.append(el('p',line.texto));
 }else if(tab.tipo==='visual_canvas'&&tab.descricao){
  // Suporte textual a fonte real; nenhum canvas ou trajetória é inventado.
  panel.append(el('p',tab.descricao));
 }else throw new Error('Bloco inválido');
 return panel;
}
/** @param {HTMLElement} container @param {import('../types.js').Cycle} cycle @param {import('../types.js').Target} target */
export function renderCycle(container,cycle,target){
 container.append(el('h2',cycle.meta.codigo.toUpperCase()+' — '+cycle.meta.titulo));
 const buttons=el('div');buttons.setAttribute('role','tablist');container.append(buttons);
 const panels=cycle.abas.map(tab=>({tab,panel:renderBlock(tab),button:document.createElement('button')}));
 /** @param {string} id */
 function select(id){for(const entry of panels){entry.panel.hidden=entry.tab.id!==id;entry.button.setAttribute('aria-selected',String(entry.tab.id===id));}}
 for(const {tab,panel,button} of panels){
  button.type='button';button.textContent=tab.titulo;button.className='btn btn-outline';button.setAttribute('role','tab');
  button.dataset.action='tab-'+tab.id;button.addEventListener('click',()=>select(tab.id));buttons.append(button);
  // Usar referências DOM evita construir seletores a partir de URL.
  for(const details of panel.querySelectorAll('details'))details.open=details.dataset.accordionId===target.accordionId;
  container.append(panel);
 }
 select(target.tabId||cycle.defaultTarget.tabId);
}
