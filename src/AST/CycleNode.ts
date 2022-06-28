import ExpressionNode from "./ExpressionNode";
import Token from "../Token";
import StatementsNode from "./StatementsNode";

export default class CycleNode extends ExpressionNode {
    operator: Token;
    condition: ExpressionNode;
    cycleNodes: StatementsNode;

    constructor(operator: Token, condition: ExpressionNode, cycleNodes: StatementsNode) {
        super();
        this.operator = operator;
        this.condition = condition;
        this.cycleNodes = cycleNodes;
    }
}