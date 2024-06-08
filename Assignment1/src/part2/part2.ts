import * as R from "ramda";

const stringToArray = R.split("");

/* Question 1 */
export const countVowels = (x: string): number => {
    return R.match(/[aeiou]/gi,x).length;
}

/* Question 2 */
export const runLengthEncoding = (str: string) : string => {
    const arrOfChars: Array<string> = R.match(/([a-zA-Z])\1*/g, str)||[];
    const arrayCharCount: Array<string> = R.map((c: string): string =>{ return c.charAt(0).concat(c.length.toString())},arrOfChars);
    return R.replace(/,|1/g, '',R.join('',arrayCharCount))
}

/* Question 3 */
export const isPaired = (str: string): boolean => {
    const parantheris: Array<string> = R.match(/[{}]|[()]|[\]]|[[]/g,str);
    const open : Array<string> = ['(','[','{'];
    const pair : string = R.reduce((acc : string, p:string) =>{
        if(R.includes(p,open)) {return R.concat(acc,p)}
        else return (openAndClose(R.slice(acc.length-1,acc.length,acc),p))? R.slice(0,-1,acc) : "notGood"
    } ,"", parantheris);
    return (pair==="")? true: false
}
const openAndClose = (o : string, c: string):boolean=>{
    return ((o==='(' && c===')') ||(o==='[' && c===']') || (o==='{' && c==='}'))? true : false;
 }
