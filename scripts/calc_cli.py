#!/usr/bin/env python3
"""Simple CLI wrapper for the calculator.

Usage:
- python3 scripts/calc_cli.py "2 + 3 * (4 - 1)"
- or: python3 scripts/calc_cli.py
   Then type expression at prompts.
"""

import sys
from utils.calculator import evaluate, CalculatorError


def main(argv) -> int:
    if len(argv) > 1:
        expression = " ".join(argv[1:])
    else:
        try:
            expression = input("Enter expression: ")
        except EOFError:
            return 1
    try:
        result = evaluate(expression)
        # Print as integer when it is whole number, else as float
        if result == int(result):
            print(int(result))
        else:
            print(result)
        return 0
    except CalculatorError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
