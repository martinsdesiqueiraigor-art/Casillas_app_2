// @ts-check
// UUID v4 com fonte criptográfica disponível também em HTTP LAN.
// Não substitui a aleatoriedade criptográfica por Math.random().
export function createLocalId(){
 if(typeof crypto==='undefined'||typeof crypto.getRandomValues!=='function')throw new Error('Gerador seguro de identificadores indisponível');
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 const bytes=new Uint8Array(16);
 crypto.getRandomValues(bytes);
 bytes[6]=(bytes[6]&0x0f)|0x40;
 bytes[8]=(bytes[8]&0x3f)|0x80;
 const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
