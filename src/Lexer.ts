import Token from "./Token";
import {tokenTypesList} from "./TokenType";

const debug = false;

export default class Lexer
{
    code: string = '';
    pos: number = 0;
    line: number = 1;
    error: number = 0;
    tokenList: Token[] = [];

    setCode(code: string)
    {
        this.code = code;
        this.pos = 0;
    }

    getTokenList() : Token[]
    {
        this.tokenList = this.tokenList.filter(
            token => token.type.name !== tokenTypesList.Space.name);

        if (debug) this.debugPrint();

        const error = this.validate_error(this.tokenList);
        if (!error) return this.tokenList;
        return [];
    }

    lexAnal()
    {
        while (this.nextToken()) {}
    }

    nextToken(): boolean
    {
        if (this.pos >= this.code.length)
        {
            return false;
        }

        const tokenTypesValues = Object.values(tokenTypesList);
        for (let i = 0; i < tokenTypesValues.length; i++)
        {
            const tokenType = tokenTypesValues[i];
            const regex = new RegExp('^' + tokenType.regex);
            const result = this.code.substr(this.pos).match(regex);

            if (result && result[0])
            {
                if (result[0].includes('\n')) this.line += 1;
                if (this.tokenList.length - 1 != -1 &&
                    this.tokenList[this.tokenList.length - 1].type == tokenTypesList.Error &&
                    tokenType == tokenTypesList.Error)
                {
                    this.tokenList[this.tokenList.length - 1].text += result[0];
                    this.pos += result[0].length;
                    return true
                }
                // console.log(`\\${result[0]}`);
                const token = new Token(tokenType, result[0], this.pos, this.line);
                this.pos += result[0].length;
                this.tokenList.push(token);
                return true;
            }
        }

        console.log(`На позиції ${this.pos} виникла помилка\n 
        Значення:${this.code.substr(this.pos, this.code.length).split(';')[0]}`);
        return false;
    }

    validate_error(token : Token[]) : boolean
    {
        let debugSize = 0;
        let error = false;
        if (debug) debugSize = tokenTypesList.Error.name.length + 3;

        this.tokenList.forEach(token =>
        {
            if (token.type == tokenTypesList.Error)
            {
                error = true;
                console.error(
                    `\nНеочікувана змінна {\x1b[31m ${token.text} \x1b[0m} у рядку ${token.line}; позиція: ${token.pos}`);

                let errorLine = this.tokenList.filter(
                    t => t.line == token.line);
                this.printTokenList(errorLine);
            }

        })

        return error;
    }

    printTokenList(tokenList: Token[]){
        let temp_line: number = 0

        tokenList.forEach(Token => {
            if (Token.line != temp_line){
                process.stdout.write(`\n${Token.line}:\t ` + ' '.repeat(Token.pos));
                temp_line = Token.line;
            }
            if (Token.type == tokenTypesList.Error) process.stdout.write(`\x1b[31m`);
            if (debug){
                process.stdout.write(`{${Token.type.name}} `);
            }
            process.stdout.write(`${Token.text} `);
            process.stdout.write(`\x1b[0m`);
        })
        process.stdout.write(`\n`)
    }

    debugPrint(){
        console.log(this.tokenList);
        this.printTokenList(this.tokenList);
    }
}
