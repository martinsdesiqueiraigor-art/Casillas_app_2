// @ts-check
import { supabase } from '../supabase.bundle.js';
export { supabase };
/** Ownership local para enfileirar/filtrar; RLS é autoridade server-side. */
export async function sessionOwner(){
 const {data,error}=await supabase.auth.getSession();
 return error?null:data.session?.user.id||null;
}
/** @param {any} client */
export function createTransport(client=supabase){
 return {
  /** @param {import('./syncQueue.js').OutboxItem} item */
  async send(item){
   if(item.payload.user_id!==item.ownerUserId)return false;
   const table=item.type==='chat_interaction'?'chat_interactions':'guide_feedback';
   const {error}=await client.from(table).insert(item.payload);
   if(!error)return true;
   if(error.code!=='23505')return false;
   // Somente equivalência comprovada por SELECT próprio permite concluir retry.
   const {data,error:readError}=await client.from(table).select('*').eq('id',item.id).eq('user_id',item.ownerUserId).maybeSingle();
   if(readError||!data)return false;
   /** @param {any} value @returns {string} */
   const stable=value=>JSON.stringify(value&&typeof value==='object'&&!Array.isArray(value)
    ?Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(stable(value[k]))])):value);
   return Object.entries(item.payload).every(([key,value])=>stable(data[key])===stable(value));
  }
 };
}
