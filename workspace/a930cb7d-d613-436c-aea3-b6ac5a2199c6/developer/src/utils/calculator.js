function calculate(a, operator, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    switch (operator) {
        case '+':
            return numA + numB;
        case '-':
            return numA - numB;
        case '*':
            return numA * numB;
        case '/':
            if (numB === 0) {
                return 'Error';
            }
            return numA / numB;
        default:
            return numB;
    }
}

function formatResult(value) {
    if (value === 'Error') {
        return 'Error';
    }
    
    if (typeof value !== 'number') {
        return value;
    }
    
    if (!isFinite(value)) {
        return 'Error';
    }
    
    const str = value.toString();
    
    if (str.length > 12) {
        return value.toExponential(6);
    }
    
    const decimalIndex = str.indexOf('.');
    if (decimalIndex !== -1) {
        const decimalPlaces = str.length - decimalIndex - 1;
        if (decimalPlaces > 10) {
            return value.toFixed(10).replace(/\.?0+$/, '');
        }
    }
    
    return str;
}

function formatDisplay(value) {
    if (value === 'Error') {
        return 'Error';
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
        return '0';
    }
    
    if (value.includes('.') && !value.endsWith('.')) {
        return value.replace(/^0+/, '').replace(/^\./, '0.') || '0';
    }
    
    return value.replace(/^0+(?!$)/, '') || '0';
}

function hasDecimalPoint(str) {
    return str.includes('.');
}

class Calculator {
    constructor() {
        this.displayValue = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.preview = '';
    }

    inputNumber(num) {
        if (this.waitingForSecondOperand) {
            this.displayValue = num;
            this.waitingForSecondOperand = false;
        } else {
            if (this.displayValue === '0' && num !== '.') {
                this.displayValue = num;
            } else if (this.displayValue.length < 12) {
                this.displayValue += num;
            }
        }
    }

    inputDecimal() {
        if (this.waitingForSecondOperand) {
            this.displayValue = '0.';
            this.waitingForSecondOperand = false;
            return;
        }
        
        if (!hasDecimalPoint(this.displayValue)) {
            this.displayValue += '.';
        }
    }

    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.displayValue);
        
        if (this.operator && this.waitingForSecondOperand) {
            this.operator = nextOperator;
            this.preview = `${this.firstOperand} ${this.getOperatorSymbol(nextOperator)}`;
            return;
        }
        
        if (this.firstOperand === null) {
            this.firstOperand = inputValue;
        } else if (this.operator) {
            const result = calculate(this.firstOperand, this.operator, inputValue);
            this.displayValue = formatResult(result);
            this.firstOperand = result === 'Error' ? null : result;
        }
        
        this.operator = nextOperator;
        this.waitingForSecondOperand = true;
        this.preview = `${this.firstOperand} ${this.getOperatorSymbol(nextOperator)}`;
    }

    getOperatorSymbol(op) {
        const symbols = { '+': '+', '-': '-', '*': '×', '/': '÷' };
        return symbols[op] || op;
    }

    calculate() {
        if (this.operator === null || this.firstOperand === null) {
            return;
        }
        
        const inputValue = parseFloat(this.displayValue);
        const result = calculate(this.firstOperand, this.operator, inputValue);
        
        this.displayValue = formatResult(result);
        this.preview = `${this.firstOperand} ${this.getOperatorSymbol(this.operator)} ${inputValue} =`;
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = true;
    }

    clear() {
        this.displayValue = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.preview = '';
    }

    clearEntry() {
        this.displayValue = '0';
    }

    backspace() {
        if (this.waitingForSecondOperand) {
            return;
        }
        
        if (this.displayValue.length > 1) {
            this.displayValue = this.displayValue.slice(0, -1);
        } else {
            this.displayValue = '0';
        }
    }

    getDisplay() {
        return formatDisplay(this.displayValue);
    }

    getPreview() {
        return this.preview;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calculator, calculate, formatResult, formatDisplay };
}