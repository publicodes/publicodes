// packages/core/src/mecanisms/logarithm.ts
import { EvaluationFunction, PublicodesError, simplifyNodeUnit } from '..';
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
    const value = simplifyNodeUnit(this.evaluateNode(node.explanation))
    let y: undefined | number | null;
    if(value.nodeValue === null || value.nodeValue === undefined) {
        y = value.nodeValue
    } else if(typeof value.nodeValue === 'number') {
        y = Math.log(value.nodeValue)
    } else {
        throw new PublicodesError(
            'EvaluationError',
            `Impossible de calculer le logarithme de ${value.nodeValue}`, {
                dottedName: this.cache._meta.evaluationRuleStack[0]
            }
        )
    }
    return {
        ...node,
        nodeValue: y,
        missingVariables: value.missingVariables,
        explanation: value,
    };
};

registerEvaluationFunction('logarithme', evaluate);
