export function readLocal<T>(key:string,fallback:T):T{
  try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}
}
export function writeLocal<T>(key:string,value:T){
  try{localStorage.setItem(key,JSON.stringify(value))}catch(error){console.error(`Unable to persist ${key}`,error)}
}
