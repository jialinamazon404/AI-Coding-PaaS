# 网页计算器

一个功能完整的网页计算器，支持四则运算、小数点处理、键盘输入和响应式布局。

## 快速启动

直接在浏览器中打开 `index.html` 即可运行：

```bash
# 方法1: 直接打开
open index.html

# 方法2: 使用本地服务器
npx serve .
```

## 功能特性

| 功能 | 描述 |
|------|------|
| 数字输入 | 支持 0-9 数字输入，最多12位 |
| 四则运算 | 加法、减法、乘法、除法 |
| 小数点 | 每个操作数支持一个小数点，最多10位精度 |
| 清除功能 | C 清除全部，CE 清除当前输入，退格删除一位 |
| 键盘支持 | 支持数字键、运算符、Enter、Escape、Backspace |
| 响应式 | 适配桌面端和移动端 |

## 项目结构

```
developer/
├── index.html          # 主页面
├── src/
│   ├── styles.css      # 样式文件
│   ├── components/
│   │   └── app.js      # 应用入口
│   └── utils/
│       └── calculator.js  # 计算器核心逻辑
└── tests/
    └── index.html      # 单元测试
```

## 使用说明

### 鼠标/触控操作

- 点击数字按钮输入数字
- 点击运算符按钮进行计算
- 点击 `=` 按钮获取结果
- 点击 `C` 清除全部
- 点击 `CE` 清除当前输入
- 点击 `←` 删除最后一位

### 键盘操作

| 按键 | 功能 |
|------|------|
| 0-9 | 输入数字 |
| + | 加法 |
| - | 减法 |
| * | 乘法 |
| / | 除法 |
| Enter | 计算结果 |
| Escape | 清除全部 |
| Backspace | 删除一位 |

## API 参考

### Calculator 类

```javascript
const calc = new Calculator();
```

#### 方法

| 方法 | 描述 | 示例 |
|------|------|------|
| `inputNumber(num)` | 输入数字 | `calc.inputNumber('5')` |
| `inputDecimal()` | 输入小数点 | `calc.inputDecimal()` |
| `inputOperator(op)` | 输入运算符 | `calc.inputOperator('+')` |
| `calculate()` | 计算结果 | `calc.calculate()` |
| `clear()` | 清除全部 | `calc.clear()` |
| `clearEntry()` | 清除当前 | `calc.clearEntry()` |
| `backspace()` | 退格 | `calc.backspace()` |
| `getDisplay()` | 获取显示值 | `calc.getDisplay()` |
| `getPreview()` | 获取预览 | `calc.getPreview()` |

### 工具函数

```javascript
// 计算函数
calculate(5, '+', 3);  // 返回 8

// 格式化结果
formatResult(123456789);  // 返回 "123456789"

// 格式化显示
formatDisplay('0123');  // 返回 "123"
```

## 环境变量

本项目为纯前端应用，无需环境变量。

## 运行测试

打开 `tests/index.html` 即可运行单元测试：

```bash
open tests/index.html
```

测试覆盖：
- Calculator 类所有方法
- 计算函数
- 格式化函数

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 开发记录

| 日期 | 内容 |
|------|------|
| 2026-03-26 | 初始化项目，创建目录结构 |
| 2026-03-26 | 实现计算器核心逻辑 (calculator.js) |
| 2026-03-26 | 实现 UI 交互 (app.js) |
| 2026-03-26 | 编写单元测试 |
| 2026-03-26 | 完成 README 文档 |

## 许可证

MIT License