const display = document.getElementById('display');
const preview = document.getElementById('preview');
const calculator = new Calculator();

function updateDisplay() {
    display.textContent = calculator.getDisplay();
    preview.textContent = calculator.getPreview();
}

document.querySelector('.keypad').addEventListener('click', (e) => {
    const button = e.target.closest('.btn');
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
        case 'number':
            calculator.inputNumber(value);
            break;
        case 'decimal':
            calculator.inputDecimal();
            break;
        case 'operator':
            calculator.inputOperator(value);
            break;
        case 'calculate':
            calculator.calculate();
            break;
        case 'clear':
            calculator.clear();
            break;
        case 'clearEntry':
            calculator.clearEntry();
            break;
        case 'backspace':
            calculator.backspace();
            break;
    }

    updateDisplay();
});

document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key >= '0' && key <= '9') {
        e.preventDefault();
        calculator.inputNumber(key);
    } else if (key === '.') {
        e.preventDefault();
        calculator.inputDecimal();
    } else if (key === '+' || key === '-') {
        e.preventDefault();
        calculator.inputOperator(key);
    } else if (key === '*') {
        e.preventDefault();
        calculator.inputOperator('*');
    } else if (key === '/') {
        e.preventDefault();
        calculator.inputOperator('/');
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculator.calculate();
    } else if (key === 'Escape') {
        e.preventDefault();
        calculator.clear();
    } else if (key === 'Backspace') {
        e.preventDefault();
        calculator.backspace();
    }

    updateDisplay();
});

updateDisplay();