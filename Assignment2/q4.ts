import { Exp, Program ,ProcExp,VarDecl,isBoolExp,isNumExp,isVarRef,isProcExp,isIfExp,isAppExp,isPrimOp,isDefineExp,isProgram, CExp, PrimOp, AppExp } from '../imp/L3-ast';
import { Result, makeFailure, makeOk, isOk } from '../shared/result';
import { map } from "ramda";
import { valueToString } from '../imp/L3-value'
import { first, rest } from '../shared/list';
/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => {
    const res : Result<string> = makeOk(unparseToPython(exp))
    if(isOk(res)) {return res}
    return makeFailure("error");
}


const unparseLExps = (les: Exp[]): string =>
    map(unparseToPython, les).join(" ");

const unparseLExpsProgram = (les: Exp[]): string =>
    map(unparseToPython, les).join("\n");

const unparseLExpsLambda = (les: Exp[]): string =>
    map(unparseToPython, les).join(",");

const unparseProcExp = (pe: ProcExp): string => 
    `(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${unparseLExps(pe.body)})`;

const addRator = (cexps : CExp[] , rator : CExp): CExp[] =>
    cexps.length === 1 ? cexps:
    [first(cexps)].concat([rator]).concat(rest(cexps));


const parseApp = (exp : AppExp) : string =>
isVarRef(exp.rator) || isProcExp(exp.rator) ?  `${unparseToPython(exp.rator)}(${unparseLExpsLambda(exp.rands)})` :
isPrimOp(exp.rator) && exp.rator.op === 'not' ?  `(not ${unparseLExps(exp.rands)})`:
isPrimOp(exp.rator) && exp.rator.op === 'and' ?  `(${unparseToPython(exp.rands[0])} and ${unparseLExps(addRator(rest(exp.rands),exp.rator))})` :
isPrimOp(exp.rator) && exp.rator.op === 'or' ?  `(${unparseToPython(exp.rands[0])} or ${unparseLExps(addRator(rest(exp.rands),exp.rator))})` :
isPrimOp(exp.rator) && (exp.rator.op === 'eq?' || exp.rator.op === '=') ?  `(${unparseToPython(exp.rands[0])} == ${unparseLExps(addRator(rest(exp.rands),exp.rator))})` :
isPrimOp(exp.rator) && exp.rator.op === 'boolean?' ?  `(lambda x : (type(x) == bool))(${unparseLExps(exp.rands)})` :
isPrimOp(exp.rator) && exp.rator.op === 'number?' ?  `(lambda x : (type(x) == int) or (type(x) == float))(${unparseLExps(exp.rands)})` :
`(${unparseToPython(exp.rands[0])} ${unparseToPython(exp.rator)} ${unparseLExps(addRator(rest(exp.rands),exp.rator))})`;

    
 
const unparseToPython = (exp: Program | Exp): string =>
    isBoolExp(exp) ? valueToString(exp.val) :
    isNumExp(exp) ? valueToString(exp.val) :
    isVarRef(exp) ? exp.var :
    isPrimOp(exp) ? exp.op:
    isProcExp(exp) ? unparseProcExp(exp) :
    isIfExp(exp) ? `(${unparseToPython(exp.then)} if ${unparseToPython(exp.test)} else ${unparseToPython(exp.alt)})`:
    isAppExp(exp) ? parseApp(exp):
    isDefineExp(exp) ? `${exp.var.var} = ${unparseToPython(exp.val)}` :
    isProgram(exp) ? `${unparseLExpsProgram(exp.exps)}` :
    "never";

