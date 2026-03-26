#!/usr/bin/env python3
import sys

from calculator import add, subtract, multiply, divide

def parse_args(args):
    if len(args) != 4:
        print("Usage: calc.py <a> <op> <b>")
        print("Example: calc.py 3 + 4")
        sys.exit(2)
    a = float(args[1])
    op = args[2]
    b = float(args[3])
    return a, op, b

def main():
    a, op, b = parse_args(sys.argv)
    if op == "+":
        res = add(a, b)
    elif op == "-":
        res = subtract(a, b)
    elif op == "*":
        res = multiply(a, b)
    elif op == "/":
        res = divide(a, b)
    else:
        print(f"Unsupported operator: {op}")
        sys.exit(2)
    print(res)

if __name__ == "__main__":
    main()
