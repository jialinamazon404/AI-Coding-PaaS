#!/usr/bin/env python3
"""
Simple two-operand calculator.
Supports: +, -, *, /
"""
from __future__ import annotations

def add(a: float, b: float) -> float:
    return a + b

def subtract(a: float, b: float) -> float:
    return a - b

def multiply(a: float, b: float) -> float:
    return a * b

def divide(a: float, b: float) -> float:
    if b == 0:
        raise ZeroDivisionError("division by zero")
    return a / b

__all__ = ["add", "subtract", "multiply", "divide"]
