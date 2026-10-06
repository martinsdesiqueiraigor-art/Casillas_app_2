// @ts-check
// Persistência IndexedDB. Upgrade aditivo preserva config, historico e cache.
const DB_NAME='casillas-app';
const DB_VERSION=2;
const STORES=['config','historico','cache','outbox'];
/** @type {IDBDatabase|null} */let dbInstance=null;
/** @type {Promise<IDBDatabase>|null} */let dbPromise=null;
export async function initDB(){
 if(dbInstance)return dbInstance;if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{for(const name of STORES)if(!req.result.objectStoreNames.contains(name))req.result.createObjectStore(name);};
  req.onsuccess=()=>{dbInstance=req.result;dbInstance.onversionchange=()=>{dbInstance?.close();dbInstance=null;dbPromise=null;};resolve(req.result);};
  req.onerror=()=>{dbPromise=null;reject(req.error);};
 });return dbPromise;
}
/** @param {string} storeName @param {IDBTransactionMode} mode @param {(store:IDBObjectStore)=>IDBRequest} request @returns {Promise<any>} */
async function transact(storeName,mode,request){
 const db=await initDB();if(!db.objectStoreNames.contains(storeName))throw new Error('Store inexistente: '+storeName);
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(storeName,mode),req=request(tx.objectStore(storeName));
  tx.oncomplete=()=>resolve(req.result);tx.onabort=()=>reject(tx.error||req.error||new Error('Transação abortada'));tx.onerror=()=>reject(tx.error);
 });
}
/** @param {string} storeName @param {IDBValidKey} key */
export async function getDB(storeName,key){return (await transact(storeName,'readonly',s=>s.get(key)))??null;}
/** @param {string} storeName @param {IDBValidKey} key @param {any} value */
export async function setDB(storeName,key,value){await transact(storeName,'readwrite',s=>s.put(value,key));return true;}
/** @param {string} storeName */
export async function getAllDB(storeName){return transact(storeName,'readonly',s=>s.getAll());}
/** @param {string} storeName @param {IDBValidKey} key */
export async function deleteDB(storeName,key){await transact(storeName,'readwrite',s=>s.delete(key));}
