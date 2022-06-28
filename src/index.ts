import * as fs from 'fs';
import Lexer from "./Lexer";
import Parser from "./Parser";

const lexer = new Lexer();

const program = fs.readFileSync('code.srp','utf8');
for (const line of program.split(/[\n]+/)){
    lexer.setCode(line+'\n');
    lexer.lexAnal();
}

lexer.printTokenList(lexer.getTokenList());


const parser = new Parser(lexer.getTokenList());
console.log(parser);
//
const rootNode = parser.parseCode();
//
// console.log(rootNode);
//
parser.printTree();
//
console.log(parser);
console.log(parser.errorFlag? 'true' : 'false');
parser.run(rootNode);
