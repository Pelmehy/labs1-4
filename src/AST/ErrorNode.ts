import ExpressionNode from "./ExpressionNode";

export default class ErrorNode extends ExpressionNode{
    error: String;
    position: number;
    line: number

    constructor(error: String, position: number, line: number) {
        super();
        this.error = error;
        this.position = position;
        this.line = line;
    }

    addError(error: string){
        this.error = '\n' + error;
    }
}
/*
    return new ErrorNode(
        `Очікується оператор присвоєння у рядку ${this.code_line}; позиція: ${this.code_pos}\`\n`,
        this.code_pos,
        this.code_line
    )

    let token = this.require(tokenTypesList.RPar)
        if(token.type == tokenTypesList.Error){
            codeStringNode = new ErrorNode(
                token.text,
                this.code_pos,
                this.code_line
            )
        }
        return codeStringNode;
*/
