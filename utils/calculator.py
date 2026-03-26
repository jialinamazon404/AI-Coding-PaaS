"""
Simple arithmetic expression evaluator.
Supports +, -, *, / and parentheses with proper precedence.
Unary minus is supported. Floats are allowed.
This is a lightweight, safe alternative to eval.
"""

import math
from typing import List


class CalculatorError(Exception):
    pass


def _tokenize(expr: str) -> List[str]:
    tokens: List[str] = []
    i = 0
    n = len(expr)
    while i < n:
        ch = expr[i]
        if ch.isspace():
            i += 1
            continue
        if ch in '+-*/()':
            tokens.append(ch)
            i += 1
            continue
        # number (int or float)
        if ch.isdigit() or ch == '.':
            j = i
            dot_count = 0
            while j < n and (expr[j].isdigit() or expr[j] == '.'):
                if expr[j] == '.':
                    dot_count += 1
                    if dot_count > 1:
                        raise CalculatorError(f"Invalid number: {expr[i:j+1]}")
                j += 1
            tokens.append(expr[i:j])
            i = j
            continue
        raise CalculatorError(f"Unexpected character: {ch}")
    return tokens


def _to_rpn(tokens: List[str]) -> List[str]:
    # Shunting-yard algorithm
    out: List[str] = []
    stack: List[str] = []
    prec = {'+': 1, '-': 1, '*': 2, '/': 2}
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if t not in prec and t not in '()':
            # number
            out.append(t)
        elif t in prec:
            while stack and stack[-1] != '(' and prec.get(stack[-1], 0) >= prec[t]:
                out.append(stack.pop())
            stack.append(t)
        elif t == '(':
            stack.append(t)
        elif t == ')':
            # pop until '('
            while stack and stack[-1] != '(':  
                out.append(stack.pop())
            if not stack or stack[-1] != '(': 
                raise CalculatorError("Mismatched parentheses")
            stack.pop()
        i += 1
    while stack:
        op = stack.pop()
        if op in '()':
            raise CalculatorError("Mismatched parentheses")
        out.append(op)
    return out


def _eval_rpn(rpn: List[str]) -> float:
    st: List[float] = []
    for tok in rpn:
        if tok in '+-*/':
            if len(st) < 2:
                raise CalculatorError("Invalid expression")
            b = st.pop()
            a = st.pop()
            if tok == '+':
                res = a + b
            elif tok == '-':
                res = a - b
            elif tok == '*':
                res = a * b
            else:
                if b == 0:
                    raise CalculatorError("Division by zero")
                res = a / b
            st.append(res)
        else:
            try:
                st.append(float(tok))
            except ValueError:
                raise CalculatorError(f"Invalid token: {tok}")
    if len(st) != 1:
        raise CalculatorError("Invalid expression")
    return st[0]


def evaluate(expression: str) -> float:
    """Evaluate a simple arithmetic expression and return a float."""
    if not expression or expression.strip() == '':
        raise CalculatorError("Empty expression")
    # Normalize to support unary minus by converting leading '-' and '(-' to '0-'
    expr = expression.strip()
    # Basic safety: prevent Python code injection attempts by limiting chars
    allowed = set("0123456789+-*/(). ")
    if any(ch not in allowed for ch in expr):
        raise CalculatorError("Unsupported characters in expression")

    # Tokenize
    tokens = _tokenize(expr)
    # Handle unary minus by transforming leading '-' or '(-' sequences into '0' term
    # We'll do a simple pass to insert zeros before unary minuses
    processed: List[str] = []
    prev = None
    for t in tokens:
        if t == '-' and (prev is None or prev in ('(', '+', '-', '*', '/')):
            processed.extend(['0', '-'])
        else:
            processed.append(t)
        prev = t
    rpn = _to_rpn(processed)
    return _eval_rpn(rpn)
