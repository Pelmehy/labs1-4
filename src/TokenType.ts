export default class TokenType{
    name: string;
    regex: string;


    constructor(name: string, regex: string) {
        this.name = name;
        this.regex = regex;
    }
}

export const tokenTypesList = {
    'SemiColon' : new TokenType('SemiColon', ';'),

    'Space' : new TokenType('Space', '[ \\n\\t\\r]'),

    'Out' : new TokenType('Output', 'write'),
    'Input' : new TokenType('Input', 'read'),

    'While' : new TokenType('While', 'while'),

    'For' : new TokenType('For', 'for'),
    'To' : new TokenType('To', 'to'),
    'Step' : new TokenType('Step', 'step'),
    'Do' : new TokenType('Do', 'do'),
    'Next' : new TokenType('Next', 'next'),
    'If' : new TokenType('If', 'if'),
    'Goto' : new TokenType('Goto', 'goto'),

    'Plus' : new TokenType('Plus', '\\+'),
    'Minus' : new TokenType('Minus', '-'),
    'Multiply' : new TokenType('Multiply', '\\*'),
    'Divide' : new TokenType('Divide', '/'),
    'Increment' : new TokenType('Increment', '\\^'),
    'Exponential' : new TokenType('Exponential', 'e'),


    'Equals' : new TokenType('Equals', '=='),
    'BiggerEquals' : new TokenType('BiggerEquals', '>='),
    'LessEquals' : new TokenType('LessEquals', '<='),

    'Assign' : new TokenType('Assign', '='),
    'Bigger' : new TokenType('Bigger', '>'),
    'Less' : new TokenType('Less', '<'),

    'true' : new TokenType('true', 'true'),
    'false' : new TokenType('false', 'false'),

    'LPar' : new TokenType('LPar', '\\('),
    'RPar' : new TokenType('RPar', '\\)'),
    'LCurly' : new TokenType('LCurly', '\\{'),
    'RCurly' : new TokenType('RCurly', '\\}'),

    'Digit' : new TokenType('Digit', '[0-9]*(?!([a-d]|[f-z]|[A-Z]))'),
    'Variable' : new TokenType('Variable', '[a-zA-Z]([a-zA-Z]|[0-9])*'),

    'Error' : new TokenType('Error', '.')
}