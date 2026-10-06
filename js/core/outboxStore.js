// @ts-check
import { getAllDB, setDB, deleteDB } from '../db.js';
/** @type {import('./syncQueue.js').Store} */
export const outboxStore={
 async put(item){await setDB('outbox',item.id,item);},
 async all(){return await getAllDB('outbox');},
 async remove(id){await deleteDB('outbox',id);}
};
