export type State<S, A> = (initialState: S) => [S, A];

export const bind = <S, A, B>(state: State<S, A>, f: (x: A) => State<S, B>): State<S,B> =>{
    return (init: S)=> {
        const tup: [S,A] = state(init)
        const newState : State<S,B> = f(tup[1]);
        return newState(tup[0])
     } 
};

