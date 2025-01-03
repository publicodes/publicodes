// packages/core/src/mecanisms/logarithm.ts
import { EvaluationFunction } from '..';
import { ASTNode } from '../AST/types';
import { registerEvaluationFunction } from '../evaluationFunctions';
import parse from '../parse';

export type LogarithmeNode = {
    explanation: ASTNode;
    nodeKind: 'logarithme';
};

export default function parseLogarithm(v, context) {
    const explanation = parse(v, context);
    return {    
        explanation,
        nodeKind: 'logarithme',
    } as LogarithmeNode;
}

const evaluate: EvaluationFunction<'logarithme'> = function (node) {
    const value = this.evaluateNode(node.explanation);
    let nodeValue = Math.log(value.nodeValue as number);
    return {
        ...node,
        nodeValue,
        missingVariables: value.missingVariables,
        explanation: value,
    };
};

registerEvaluationFunction('logarithme', evaluate);
