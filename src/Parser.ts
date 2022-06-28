import Token from "./Token";
import TokenType, {tokenTypesList} from "./TokenType";
import {match} from "assert";
import {type} from "os";
import ExpressionNode from "./AST/ExpressionNode";
import StatementsNode from "./AST/StatementsNode";
import NumberNode from "./AST/NumberNode";
import ValidateNode from "./AST/ValidateNode";
import BinOperationNode from "./AST/BinOperationNode";
import UnarOperationNode from "./AST/UnarOperationNode";
import CycleNode from "./AST/CycleNode";
import ErrorNode from "./AST/ErrorNode";

export default class Parser {
    tokens: Token[];
    root: StatementsNode = new StatementsNode();
    pos: number = 0;
    code_line: number = 1;
    code_pos: number = 1;
    errorFlag: boolean = false;
    scope: any = {};


    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    match(...exepted: TokenType[]): Token | null {
        if (this.pos < this.tokens.length){
            const currentToken = this.tokens[this.pos];

            this.code_line = currentToken.line;
            this.code_pos = currentToken.pos;

            if (exepted.find(type => type.name === currentToken.type.name)){
                this.pos += 1;
                return currentToken;
            }
        }
        return null;
    }

    require(...exepted: TokenType[]): Token {
        const token = this.match(...exepted);
        if (!token) {
            this.errorFlag = true;
            return new Token(tokenTypesList.Error,
                `Очікується ${exepted[0].regex} у рядку ${this.code_line}; позиція: ${this.code_pos}`,
                this.code_pos,
                this.code_line
            )
        }

        return token;
    }

    parseVariableOrNumber(): ExpressionNode{
        const number = this.match(tokenTypesList.Digit);
        if (number != null){
            return new NumberNode(number);
        }

        const variable = this.match(tokenTypesList.Variable);
        if (variable != null){
            console.log(variable.text);
            return new ValidateNode(variable);
        }
        return new ErrorNode(
            `Очікується змінна або число у рядку ${this.code_line}; позиція: ${this.code_pos}`,
            this.code_pos,
            this.code_line)
    }

    parsePrint(): ExpressionNode{
        const operatorOut = this.match(tokenTypesList.Out);
        if (operatorOut != null){
            return new UnarOperationNode(operatorOut, this.parseFormula());
        }

        this.errorFlag = true;
        return new ErrorNode(
            `Очікується унарний оператор out у рядку ${this.code_line}; позиція: ${this.code_pos}\n`,
            this.code_pos,
            this.code_line
        )
    }

    parseParentheses(): ExpressionNode {
        if (this.match(tokenTypesList.LPar) != null){
            let node = this.parseFormula();
            let token = this.require(tokenTypesList.RPar);
            if(token.type == tokenTypesList.Error){
                node = new ErrorNode(
                    token.text,
                    this.code_pos,
                    this.code_line
                )
            }
            return node;
        }
        else {
            return this.parseVariableOrNumber();
        }
    }

    parseFormula(): ExpressionNode {
        let leftNode = this.parseParentheses();
        let operator = this.match(
            tokenTypesList.Assign,
            tokenTypesList.Plus,
            tokenTypesList.Minus,
            tokenTypesList.Multiply,
            tokenTypesList.Divide,
            tokenTypesList.Increment,

            tokenTypesList.Equals,
            tokenTypesList.BiggerEquals,
            tokenTypesList.Bigger,
            tokenTypesList.LessEquals,
            tokenTypesList.Less
        );



        while (operator != null){
            const rightNode = this.parseParentheses();
            leftNode = new BinOperationNode(operator, leftNode, rightNode);
            operator = this.match(
                tokenTypesList.Plus,
                tokenTypesList.Minus,
                tokenTypesList.Multiply,
                tokenTypesList.Divide,
                tokenTypesList.Increment,

                tokenTypesList.Equals,
                tokenTypesList.BiggerEquals,
                tokenTypesList.Bigger,
                tokenTypesList.LessEquals,
                tokenTypesList.Less,
            );
        }

        return leftNode;
    }

     parseExpression() : ExpressionNode {
        if (this.match(tokenTypesList.Variable) == null) {
            if (this.match(tokenTypesList.Out)){
                this.pos -= 1;
                const printNode = this.parsePrint();
                return printNode;
            }
            else if (this.match(tokenTypesList.Do)){
                this.pos -= 1;
                const DoWhileNode = this.parseRightFunction();
                return DoWhileNode;
            }
        }

        this.pos -= 1;
        let variableNode = this.parseVariableOrNumber();
        const assignOperator = this.match(tokenTypesList.Assign);

        if(assignOperator != null){
            const rightFormulaNode = this.parseFormula();
            const binaryNode = new BinOperationNode(assignOperator, variableNode, rightFormulaNode);
            return binaryNode;
        }

         throw new Error(`Очікується оператор присвоєння на позиції ${this.pos}\n`)


         // this.pos += 1;
        // this.errorFlag = true;
        // return new ErrorNode(
        //     `Очікується оператор присвоєння у рядку ${this.code_line}; позиція: ${this.code_pos}\n`,
        //     this.code_pos,
        //     this.code_line
        // )
    }

    parseCode(): ExpressionNode {
        while (this.pos < this.tokens.length) {
            let codeStringNode = this.parseExpression();
            let token = this.require(tokenTypesList.SemiColon);
            if(token.type == tokenTypesList.Error){
                codeStringNode = new ErrorNode(
                    token.text,
                    this.code_pos,
                    this.code_line
                )
            }
            this.root.addNode(codeStringNode);
        }

        return this.root;
    }

    parseRightFunctionCode(): ExpressionNode {
        let codeStringNode = this.parseExpression();
        let token = this.require(tokenTypesList.SemiColon);
        if(token.type == tokenTypesList.Error){
            this.errorFlag = true;
            this.pos += 1;
            codeStringNode = new ErrorNode(
                token.text,
                this.code_pos,
                this.code_line
            )
        }
        return codeStringNode;
    }

    parseRightFunction(): ExpressionNode{
        let error = false;
        let rightFunction = this.match(tokenTypesList.Do)
        const errorNode = new ErrorNode('', this.code_pos, this.code_line);
        const localNodes = new StatementsNode();

        console.log(rightFunction);
        if (rightFunction == null) {
            errorNode.addError(
                `Очікується змінна або число ${this.code_line}; позиція: ${this.code_pos}\n`,
            )
        }

        let token = this.require(tokenTypesList.LCurly);
        if(token.type == tokenTypesList.Error){
            errorNode.addError(token.text);
        }

        do {
            const node = this.parseRightFunctionCode();
            localNodes.addNode(node);

            if (this.match(tokenTypesList.RCurly)){
                break;
            }
            else if (this.pos >= this.tokens.length){
                error = true;
                break;
            }
            // this.pos -= 2;
        } while (true)

        if (!error){
            token = this.require(tokenTypesList.While);
            if(token.type == tokenTypesList.Error){
                errorNode.addError(token.text);
            }
            const condition = this.parseFormula();

            if (rightFunction != null){
                return new CycleNode(rightFunction, condition, localNodes);
            }
            this.errorFlag = true;
            return errorNode;

        }

        this.errorFlag = true;
        // console.log(errorNode.error);
        token = this.require(tokenTypesList.RCurly);
        errorNode.addError(token.text);
        return errorNode;

    }

    run(node: ExpressionNode): any{

        if (this.errorFlag){
            console.log('Errors!');
            if (node instanceof ErrorNode){
                console .log(node.error);
            }
            return
        }

        if (node instanceof NumberNode) {
            return parseInt(node.number.text);
        }
        if (node instanceof UnarOperationNode) {
            switch (node.operator.type.name) {
                case tokenTypesList.Out.name:
                    console.log(this.run(node.operand));
                    return;
            }
        }
        if (node instanceof CycleNode){
            do {
                node.cycleNodes.codeStrings.forEach(codeString => {
                    this.run(codeString);
                })
            } while (this.run(node.condition));

            return;
        }
        if (node instanceof BinOperationNode) {
            switch (node.operator.type.name) {
                case tokenTypesList.Plus.name:
                    return this.run(node.leftNode) + this.run(node.rightNode);

                case tokenTypesList.Minus.name:
                    return this.run(node.leftNode) - this.run(node.rightNode);

                case tokenTypesList.Multiply.name:
                    return this.run(node.leftNode) * this.run(node.rightNode);

                case tokenTypesList.Divide.name:
                    return this.run(node.leftNode) / this.run(node.rightNode);

                case tokenTypesList.Increment.name:
                    return Math.pow(this.run(node.leftNode), this.run(node.rightNode));

                case tokenTypesList.Assign.name:
                    const result = this.run(node.rightNode);
                    const variableNode = <ValidateNode>node.leftNode;
                    this.scope[variableNode.variable.text] = result;
                    return result;

                case tokenTypesList.Equals.name:
                    return this.run(node.leftNode) == this.run(node.rightNode);

                case tokenTypesList.BiggerEquals.name:
                    return this.run(node.leftNode) >= this.run(node.rightNode);

                case tokenTypesList.Bigger.name:
                    return this.run(node.leftNode) > this.run(node.rightNode);

                case tokenTypesList.LessEquals.name:
                    return this.run(node.leftNode) <= this.run(node.rightNode);

                case tokenTypesList.Less.name:
                    return this.run(node.leftNode) < this.run(node.rightNode);
            }
        }
        if (node instanceof ValidateNode){
            if (node.variable.text in this.scope){
                return this.scope[node.variable.text];
            } else {
                console.log(`Змінна з назвої ${node.variable.text} не знайдена. Рядок: ${this.code_line}; позиція: ${this.code_pos}\n`);
                throw new Error('');
                // return this.run(new ErrorNode(
                //     `Змінна з назвої ${node.variable.text} не знайдена. Рядок: ${this.code_line}; позиція: ${this.code_pos}\n`,
                //     this.code_pos,
                //     this.code_line
                // ))
            }
        }
        if (node instanceof StatementsNode){
            node.codeStrings.forEach(codeString => {
                this.run(codeString);
            })
            return;
        }

        throw new Error('Error!!!!!1!1!')
    }
}

// printTree(){
//     this.root.codeStrings.forEach(node => {
//         this.printNode(node);
//     })
// }

// printNode(node: ExpressionNode, counter: number = 0) {
//     if (node instanceof NumberNode) {
//         console.log('\t'.repeat(counter) +
//             '{NumberNode}' + '\n' +
//             '\t'.repeat(counter) +
//             node.number.text);
//
//         return
//     }
//     if (node instanceof ValidateNode){
//         console.log(
//             '\t'.repeat(counter) + '{ValidateNode}' + '\n' +
//             '\t'.repeat(counter) + node.variable.text
//         );
//
//
//         return
//     }
//     if (node instanceof ErrorNode){
//         console.log(node.error);
//
//         return;
//     }
//     if (node instanceof UnarOperationNode) {
//         console.log(
//             '\t'.repeat(counter) +
//             '{UnarOperationNode}' + '\n' +
//             '\t'.repeat(counter) +
//             node.operator.text);
//         this.printNode(node.operand, counter + 1);
//
//
//         return
//     }
//     if (node instanceof CycleNode){
//         console.log(
//             '\t'.repeat(counter) + '{CycleNode}' + '\n' +
//             '\t'.repeat(counter) + node.operator.text);
//
//         console.log('\t'.repeat(counter + 1) + '[condition]');
//         this.printNode(node.condition, counter + 1);
//
//         console.log('\t'.repeat(counter + 1) + '[cycleNodes]');
//         node.cycleNodes.codeStrings.forEach(cycleStatements =>{
//             this.printNode(cycleStatements, counter + 1);
//         })
//
//         return
//     }
//     if (node instanceof BinOperationNode) {
//         console.log(
//             '\t'.repeat(counter) + '{BinOperationNode}' + '\n' +
//             '\t'.repeat(counter) + node.operator.text
//         );
//         this.printNode(node.leftNode, counter + 1);
//         this.printNode(node.rightNode, counter + 1);
//
//         return
//     }
//
//     if (node instanceof StatementsNode){
//         console.log(
//             '\t'.repeat(counter) + '{StatementsNode}' + '\n');
//
//         node.codeStrings.forEach(codeStrings =>{
//             this.printNode(codeStrings, counter + 1);
//         })
//
//
//         return
//     }
//
//     console.log(node);
//
//
// }