import { add, map, zipWith } from "ramda";
import { Value } from './L21-value-store';
import { Result, makeFailure, makeOk, bind, either } from "../shared/result";
import { cons } from "../shared/list";

// ========================================================
// Box datatype
// Encapsulate mutation in a single type.
type Box<T> = T[];
const makeBox = <T>(x: T): Box<T> => ([x]);
const unbox = <T>(b: Box<T>): T => b[0];
const setBox = <T>(b: Box<T>, v: T): void => { b[0] = v; return; }

// ========================================================
// Store datatype
export interface Store {
    tag: "Store";
    vals: Box<Box<Value>[]>; //added
}

export const isStore = (x: any): x is Store => x.tag === "Store";
export const makeEmptyStore = (): Store => ({tag: "Store", vals:makeBox([])});
export const theStore: Store = makeEmptyStore();
export const extendStore = (s: Store, val: Value): Store =>{
    const updatedB: Box<Value>[] = unbox(s.vals).concat([makeBox(val)]);
    setBox(s.vals,updatedB);
    return s;
}

export const applyStore = (store: Store, address: number): Result<Value> =>{
    return (address > -1)? makeOk(unbox(unbox(store.vals)[address])) : makeFailure('invalid address'); 
}
    
export const setStore = (store: Store, address: number, val: Value): void => 
   {setBox(unbox(store.vals)[address],val); return; };


// ========================================================
// Environment data type
// export type Env = EmptyEnv | ExtEnv;
export type Env = GlobalEnv | ExtEnv;

interface GlobalEnv {
    tag: "GlobalEnv";
    vars: Box<string[]>;
    addresses: Box<number[]>
}

export interface ExtEnv {
    tag: "ExtEnv";
    vars: string[];
    addresses: number[];
    nextEnv: Env;
}

const makeGlobalEnv = (): GlobalEnv =>
    ({tag: "GlobalEnv", vars: makeBox([]), addresses:makeBox([])});

export const isGlobalEnv = (x: any): x is GlobalEnv => x.tag === "GlobalEnv";

// There is a single mutable value in the type Global-env
export const theGlobalEnv = makeGlobalEnv();

export const makeExtEnv = (vs: string[], addresses: number[], env: Env): ExtEnv =>
    ({tag: "ExtEnv", vars: vs, addresses: addresses, nextEnv: env});

const isExtEnv = (x: any): x is ExtEnv => x.tag === "ExtEnv";

export const isEnv = (x: any): x is Env => isGlobalEnv(x) || isExtEnv(x);

// Apply-env
export const applyEnv = (env: Env, v: string): Result<number> =>
    isGlobalEnv(env) ? applyGlobalEnv(env, v) :
    applyExtEnv(env, v);

const applyGlobalEnv = (env: GlobalEnv, v: string): Result<number> => {
    const indexInEnv: number = unbox(env.vars).indexOf(v);
    const address: number = unbox(env.addresses)[indexInEnv];   
    return (address > -1) ? makeOk(address) : makeFailure(v+' :value does not exist in env');
}

export const globalEnvAddBinding = (v: string, addr: number): void =>{
   const newVars: string[] =  unbox(theGlobalEnv.vars).concat([v]);
   const newAddressess: number[] = unbox(theGlobalEnv.addresses).concat([addr]);
   setBox(theGlobalEnv.vars,newVars);
   setBox(theGlobalEnv.addresses,newAddressess);
}

const applyExtEnv = (env: ExtEnv, v: string): Result<number> =>
    env.vars.includes(v) ? makeOk(env.addresses[env.vars.indexOf(v)]) :
    applyEnv(env.nextEnv, v);


//added
export const applyEnvStore = (v:string, env: Env) : Result<Value>=>
    bind(applyEnv(env,v),(x: number)=>applyStore(theStore,x))