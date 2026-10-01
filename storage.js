const request = (r) => new Promise((resolve,reject)=> { r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
let connection;
async function db() {
  if (!connection) connection = new Promise((resolve,reject)=> {
    const r=indexedDB.open('rest-time-v1',1);
    r.onupgradeneeded=()=> { r.result.createObjectStore('accounts',{keyPath:'id'}).createIndex('identity','identity',{unique:true}); r.result.createObjectStore('personal',{keyPath:'id'}); };
    r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
  });
  return connection;
}
async function read(store,key,index) {
  const conn=await db(), target=conn.transaction(store).objectStore(store);
  return request((index ? target.index(index):target).get(key));
}
async function put(store,value) {
  const conn=await db();
  return new Promise((resolve,reject)=> { const tx=conn.transaction(store,'readwrite'); tx.objectStore(store).put(value); tx.oncomplete=()=>resolve(value); tx.onerror=()=>reject(tx.error); tx.onabort=()=>reject(tx.error); });
}
const bytesToHex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
async function passwordHash(password,salt) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return bytesToHex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},key,256));
}
export const storage={
  async signup(name,identity,password) {
    identity=identity.trim().toLowerCase();
    if(await read('accounts',identity,'identity')) throw new Error('An account with this username / email already exists.');
    const salt=bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    const account={id:crypto.randomUUID(),name:name.trim(),identity,salt,hash:await passwordHash(password,salt)};
    await put('accounts',account);return {id:account.id,name:account.name,identity};
  },
  async login(identity,password) {
    const account=await read('accounts',identity.trim().toLowerCase(),'identity');
    if(!account || await passwordHash(password,account.salt)!==account.hash) throw new Error('Incorrect username / email or password.');
    return {id:account.id,name:account.name,identity:account.identity};
  },
  async account(id) {const a=await read('accounts',id);return a?{id:a.id,name:a.name,identity:a.identity}:null;},
  async personal(id) { return await read('personal',id) ?? {id,samples:[],messages:[],language:'zh',sound:true,profile:{}}; },
  savePersonal: value=>put('personal',value),
};
