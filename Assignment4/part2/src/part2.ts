/* 2.1 */

export const MISSING_KEY = '___MISSING___'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}


export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    const store = new Map<K,V>();
    return {
        get(key: K) {
            const value = store.get(key);
            return  new Promise<V>((resolve,reject)=> value === undefined ? reject(MISSING_KEY) : resolve(value));
        },
        set(key: K, value: V) {
            store.set(key,value);
            return new Promise<void>((resolve,reject)=>resolve());
        },
        delete(key: K) {
            const value = store.get(key);
            return  value === undefined? new Promise<void>((resolve,reject)=>reject(MISSING_KEY)) : new Promise<void>((resolve,reject)=>resolve());
        },
    }
}

export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<Array<V>> {
    const listOfPromise: Array<Promise<V>> = keys.map((k:K) => store.get(k));
    return Promise.all(listOfPromise);
}
/* 2.2 */

// ??? (you may want to add helper functions here)
export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    const store: PromisedStore<T,R> = makePromisedStore<T,R>();
    return async (param: T)=>{
        try{
            const s = await store.get(param)
            return s;
        }
        catch(error){
            store.set(param,f(param))
            return store.get(param)
        }
    }
}


/* 2.3 */

export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (x: T)=> boolean): ()=>Generator<T> {
    const givenGenerator :Generator<T> = genFn()
    function* newGen() : Generator<T>{
       for(let i of givenGenerator){
            if(filterFn(i)){
                yield i;
            }
       }
    }
    return newGen;
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (x:T)=>T): () => Generator<T> {
    const givenGenerator :Generator<T> = genFn()
    function* newGen() : Generator<T>{
       for(let i of givenGenerator){
            yield mapFn(i)
       }
    }
    return newGen;
}

/* 2.4 */
// you can use 'any' in this question

export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((x:any)=> Promise<any>)[]]): Promise<any> {
    let val:any;
    for(let fn of fns){
        let counter: number = 1
        while(true){
            try{
                val = await fn(val)
                break;
            }
            catch(err){
                if(counter === 3){
                    throw Error("failed 3 times.");
                }
                counter++
                await new Promise((resolve)=>setTimeout(()=>resolve(fn),2000))
            }
        }
    }
    return val;
}