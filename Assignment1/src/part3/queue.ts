import { State, bind } from "./state";

export type Queue = number[];

export const enqueue = (x: number) : State<Queue,undefined> =>{
    return (q:Queue) => [q.concat(x),undefined];
};

export const dequeue = (q : Queue) : [Queue,number] =>{
    return [q.slice(1),q[0]];
}

export const queueManip = (q : Queue) : [Queue,number] =>{
    return bind(dequeue,(x:number)=>bind(enqueue(2*x),()=>bind(enqueue(x/3),()=>dequeue)))(q)
}



