import { State, bind } from "./state";

export type Stack = number[];

export const push = (x: number): State<Stack,undefined>=>{
    return (s:Stack) => [[x].concat(s),undefined]
};

export const pop = (s: Stack):[Stack,number]=>{
    return [s.slice(1),s[0]];
};

export const stackManip = (s: Stack) : [Stack,undefined]=>{
    return bind(pop,(x:number)=>bind(push(x*x),()=>bind(pop,(y:number)=>push(x+y))))(s)
}
