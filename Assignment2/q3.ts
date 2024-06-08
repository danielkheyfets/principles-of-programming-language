import { ClassExp, ProcExp,Exp, Program,makeIfExp,AppExp,makeAppExp,makePrimOp,makeVarRef,makeLitExp,makeProcExp,CExp,makeBoolExp,Binding,makeVarDecl,makeDefineExp, makeLetExp, makeProgram, isExp, isClassExp,isAppExp, isAtomicExp, isCExp, isDefineExp, isIfExp, isLetExp, isLitExp, isProcExp, isProgram} from "./L31-ast";
import { Result, makeFailure, makeOk} from "../shared/result";
import { rest } from "../shared/list";
import { map } from "ramda";
import { isBoolExp, isNumExp, isStrExp } from "../imp/L3-ast";
import { makeSymbolSExp } from "../imp/L3-value";



/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>
    makeProcExp(exp.fields,[makeProcExp([makeVarDecl("msg")],[convertToIf(exp.methods)])]);


const convertToIf = (bindings : Binding[]) : CExp=>{
    if(bindings.length === 0) {return makeBoolExp(false)}
    const test : AppExp = makeAppExp(makePrimOp("eq?"),[makeVarRef("msg"),makeLitExp(makeSymbolSExp(bindings[0].var.var))]);
    return makeIfExp(test,makeAppExp(bindings[0].val,[]),convertToIf(rest(bindings)))
}

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
     isExp(exp) ? makeOk(rewriteAllClassExp(exp)) :
     isProgram(exp) ? makeOk(makeProgram(map(rewriteAllClassExp, exp.exps))):
     makeFailure("Error in parse to L3");

const rewriteAllClassExp = (exp: Exp): Exp =>
    isCExp(exp) ? rewriteAllClassCExp(exp) : 
    isDefineExp(exp) ? makeDefineExp(exp.var,rewriteAllClassCExp(exp.val)):
    exp;

const rewriteAllClassCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isLitExp(exp) ? exp :
    isStrExp(exp) ? exp:
    isBoolExp(exp) ? exp:
    isNumExp(exp) ? exp:
    isIfExp(exp) ? makeIfExp(rewriteAllClassCExp(exp.test),rewriteAllClassCExp(exp.then),rewriteAllClassCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteAllClassCExp(exp.rator),map(rewriteAllClassCExp,exp.rands)) : 
    isProcExp(exp) ? makeProcExp(exp.args,map(rewriteAllClassCExp,exp.body)) : 
    isLetExp(exp) ? makeLetExp(exp.bindings,map(rewriteAllClassCExp,exp.body)) : 
    isClassExp(exp) ? rewriteAllClassCExp(class2proc(exp)):
    exp;




    
