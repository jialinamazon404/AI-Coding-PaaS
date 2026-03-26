# 网页计算器 - 架构设计

## 1. 系统架构总览

```mermaid
graph TB
    subgraph Client["🌐 浏览器端 (Client)"]
        direction TB
        
        subgraph UI["🎨 UI 层"]
            Display["📺 Display<br/>显示屏"]
            Keypad["🔢 Keypad<br/>按键区"]
        end
        
        subgraph Logic["⚙️ 业务逻辑层"]
            InputHandler["📥 输入处理器"]
            CalcEngine["🔢 计算引擎"]
            StateManager["📊 状态管理"]
        end
        
        subgraph Events["🔔 事件层"]
            ClickEvents["🖱️ 点击事件"]
            KeyEvents["⌨️ 键盘事件"]
        end
    end
    
    User["👤 用户"] --> ClickEvents
    User --> KeyEvents
    ClickEvents --> Keypad
    KeyEvents --> Keypad
    Keypad --> InputHandler
    InputHandler --> StateManager
    StateManager --> CalcEngine
    CalcEngine --> Display
    
    style Client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style UI fill:#fff3e0,stroke:#ef6c00
    style Logic fill:#e8f5e9,stroke:#2e7d32
    style Events fill:#fce4ec,stroke:#c2185b
```

## 2. 组件层次结构

```mermaid
graph TD
    Calculator["🧮 Calculator<br/>根组件"] --> Display
    Calculator --> Keypad
    Calculator --> KeyboardHandler
    
    Display --> Result["💬 Result<br/>计算结果"]
    Display --> Expression["📝 Expression<br/>表达式"]
    
    Keypad --> Numbers["🔢 数字键<br/>0-9"]
    Keypad --> Operators["➕ 运算符<br/>+ - × ÷"]
    Keypad --> Functions["⚡ 功能键<br/>C CE ="]
    Keypad --> Decimal["🔹 小数点"]
    
    style Calculator fill:#3f51b5,color:#fff
    style Display fill:#ff9800,color:#fff
    style Keypad fill:#4caf50,color:#fff
```

## 3. 状态机流程

```mermaid
stateDiagram-v2
    [*] --> Initial
    
    Initial --> InputFirst: 输入数字
    InputFirst --> InputFirst: 继续输入
    InputFirst --> OpSelected: 选择运算符
    
    OpSelected --> InputSecond: 输入数字
    InputSecond --> InputSecond: 继续输入
    InputSecond --> OpSelected: 切换运算符
    
    OpSelected --> Calculate: 按 =
    Calculate --> ShowResult: 计算完成
    ShowResult --> Initial: 准备下次计算
    
    Initial --> Clear: 按 C
    Clear --> Initial
    
    InputFirst --> ClearEntry: 按 CE
    ClearEntry --> Initial
    
    InputSecond --> Backspace: 按退格
    Backspace --> InputSecond
    
    note right of Calculate
      除法需检查除数是否为0
      浮点数精度需处理
    end note
```

## 4. 数据流

```mermaid
sequenceDiagram
    participant U as 👤 用户
    participant K as ⌨️ Keypad
    participant I as 📥 InputHandler
    participant S as 📊 State
    participant C as 🔢 Calculator
    participant D as 📺 Display
    
    U->>K: 点击按钮 "5"
    K->>I: 传递按键事件
    I->>S: 更新状态 display="5"
    S->>C: 触发重新渲染
    C->>D: 更新显示内容
    
    U->>K: 点击 "+"
    K->>I: 传递运算符
    I->>S: 更新 operator="+"
    S->>C: 标记等待第二操作数
    
    U->>K: 点击 "3"
    K->>I: 传递按键事件
    I->>S: 更新 display="3"
    S->>C: 触发重新渲染
    
    U->>K: 点击 "="
    K->>I: 传递等号事件
    I->>C: 执行 calculate(5, "+", 3)
    C->>S: 更新状态 result=8
    S->>D: 显示结果 "8"
```

## 5. 技术架构

```mermaid
graph LR
    subgraph TechStack["🛠️ 技术栈"]
        HTML["📄 HTML5"]
        CSS["🎨 CSS3"]
        JS["⚡ JavaScript<br/>ES6+"]
    end
    
    subgraph Files["📁 文件结构"]
        Index["index.html"]
        Styles["styles.css"]
        App["app.js"]
    end
    
    subgraph Deploy["🚀 部署"]
        GH["GitHub Pages"]
        Vercel["Vercel"]
        Netlify["Netlify"]
    end
    
    HTML --> Index
    CSS --> Styles
    JS --> App
    
    Index --> GH
    Styles --> Vercel
    App --> Netlify
    
    style TechStack fill:#e1f5fe,stroke:#0277bd
    style Files fill:#f3e5f5,stroke:#7b1fa2
    style Deploy fill:#e8f5e9,stroke:#2e7d32
```

## 6. 核心模块

### 6.1 Calculator 核心类

```javascript
class Calculator {
  // 状态
  state = {
    display: '0',
    firstOperand: null,
    operator: null,
    waitingForSecond: false
  };
  
  // 方法
  inputNumber(num) { ... }
  inputOperator(op) { ... }
  inputDecimal() { ... }
  calculate() { ... }
  clear() { ... }
  clearEntry() { ... }
  backspace() { ... }
}
```

### 6.2 计算精度处理

```javascript
// 浮点精度问题解决方案
function preciseCalculate(a, op, b) {
  const precision = 10; // 小数位精度
  let result;
  
  switch(op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': 
      if (b === 0) return 'Error';
      result = a / b;
      break;
  }
  
  // 四舍五入处理精度
  return Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);
}
```

## 7. 键盘映射

| 按键 | 功能 | 映射 |
|------|------|------|
| `0-9` | 数字输入 | `NumberButtons` |
| `+` | 加法 | `OperatorButton` |
| `-` | 减法 | `OperatorButton` |
| `*` | 乘法 | `OperatorButton` |
| `/` | 除法 | `OperatorButton` |
| `Enter` 或 `=` | 计算结果 | `EqualsButton` |
| `Escape` | 清除全部 (C) | `ClearButton` |
| `Backspace` | 退格 | `BackspaceButton` |
| `.` | 小数点 | `DecimalButton` |

## 8. 响应式断点

```mermaid
graph LR
    Mobile["📱 Mobile<br/>< 480px"]
    Tablet["📲 Tablet<br/>480-768px"]
    Desktop["🖥️ Desktop<br/>> 768px"]
    
    Mobile --> Btn44["按钮 ≥44px<br/>触摸友好"]
    Tablet --> Btn48["按钮 ≥48px"]
    Desktop --> Btn50["按钮 ≥50px<br/>鼠标友好"]
    
    style Mobile fill:#ffccbc,stroke:#d84315
    style Tablet fill:#bcaaa4,stroke:#5d4037
    style Desktop fill:#cfd8dc,stroke:#455a64
```

---

## 架构总结

| 维度 | 方案 |
|------|------|
| **架构类型** | 纯前端、单页面应用 |
| **技术栈** | 原生 HTML + CSS + JavaScript |
| **复杂度** | 低 |
| **依赖** | 零依赖 |
| **部署** | 静态文件托管 |
| **预估工时** | 1-2 天 |

**关键决策**: 由于 PRD 明确指出无需后端、无需 API，本项目采用最简单的原生 JS 实现，零依赖，可直接浏览器运行。
