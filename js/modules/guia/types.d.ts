export interface Target {cycleId:string;tabId?:string;accordionId?:string}
export interface Accordion {id:string;titulo:string;texto?:string;parametros?:{nome:string;desc:string}[]}
export interface Tab {id:string;tipo:string;titulo:string;acordeoes?:Accordion[];bloco_gcode?:string[];linhas_explicadas?:{linha:number;texto:string}[];descricao?:string}
export interface Cycle {meta:{id:string;aliases:string[];controlador:string;maquina:string;codigo:string;titulo:string;tags:string[]};contexto:{operacao:string;categoriaOriginal:string};abas:Tab[];defaultTarget:{tabId:string;accordionId?:string}}
export interface Slots {controlador?:string;maquina?:string;operacao?:string;codigo?:string}
