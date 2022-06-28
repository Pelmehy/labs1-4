import TokenType from "./TokenType";

export default class Token{
    type: TokenType;
    text: string;
    pos: number;
    line: number;

    constructor(type: TokenType, text: string, pos: number, line: number) {
        this.type = type;
        this.text = text;
        this.pos = pos;
        this.line = line;
    }
}