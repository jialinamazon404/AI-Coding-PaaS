(function() {
  const display = document.getElementById('display');
  const buttons = document.getElementById('buttons');
  let expression = '';

  const updateDisplay = () => {
    display.textContent = expression || '0';
  };

  const append = (val) => {
    expression += val;
    updateDisplay();
  };

  const backspace = () => {
    expression = expression.slice(0, -1);
    updateDisplay();
  };

  const clearAll = () => {
    expression = '';
    updateDisplay();
  };

  const calculate = () => {
    try {
      const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
      // Evaluate expression safely in this local, controlled context
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + sanitized + ')')();
      expression = String(result);
      updateDisplay();
    } catch (e) {
      display.textContent = 'Error';
      expression = '';
    }
  };

  // Button clicks
  for (const btn of buttons.querySelectorAll('button')) {
    btn.addEventListener('click', () => {
      if (btn.hasAttribute('data-number')) {
        append(btn.getAttribute('data-number'));
      } else if (btn.hasAttribute('data-action')) {
        const action = btn.getAttribute('data-action');
        if (action === 'clear-all') {
          clearAll();
        } else if (action === 'backspace') {
          backspace();
        } else if (action === 'equals') {
          calculate();
        } else if (action === 'operator') {
          const op = btn.getAttribute('data-operator');
          append(op);
        }
      }
    });
  }

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((/^[0-9]$/.test(key)) || key === '.') {
      append(key);
      e.preventDefault();
    } else if (['+', '-', '*', '/'].includes(key)) {
      append(key);
      e.preventDefault();
    } else if (key === 'Enter' || key === '=') {
      calculate();
      e.preventDefault();
    } else if (key === 'Backspace') {
      backspace();
      e.preventDefault();
    } else if (key === 'Escape') {
      clearAll();
      e.preventDefault();
    } else if (key === '(' || key === ')') {
      append(key);
      e.preventDefault();
    }
  });

  // Init
  updateDisplay();
})();
