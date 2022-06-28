import ExpressionNode from "./ExpressionNode";
import Token from "../Token";

export default class UnarOperationNode {
    operator: Token;
    operand: ExpressionNode;


    constructor(operator: Token, operand: ExpressionNode) {
        this.operator = operator;
        this.operand = operand;
    }
}