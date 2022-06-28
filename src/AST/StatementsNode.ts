import ExpressionNode from "./ExpressionNode";

export default class StatementsNode {
    codeStrings: ExpressionNode[] = [];

    addNode(node: ExpressionNode){
        this.codeStrings.push(node);
    }
}