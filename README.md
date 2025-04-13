# Test03 多时间周期交易策略

## 策略概述

Test03是一个基于多时间周期、多技术指标的MetaTrader 4自动交易策略。该策略通过分析5分钟、1小时和4小时时间周期的金叉和死叉信号，结合趋势强度评估，实现自动化交易决策。

## 核心功能

- **多时间周期分析**：同时监控5分钟、1小时和4小时图表的信号
- **多指标组合**：使用K线、KD、MA和MACD等多种技术指标进行信号确认
- **趋势强度评估**：通过`qushi()`函数计算市场趋势强度，避免震荡市场交易
- **动态仓位管理**：根据账户净值和趋势强度自动调整交易量
- **智能止损设置**：基于ATR、价格高低点和移动平均线计算最优止损位
- **移动止损功能**：通过`sl_move()`函数实现止损的动态调整

## 参数设置
extern int magic = 52142;            // 订单签名
extern double ATR_MAX = 2.5;         // 5分钟1周期ATR阈值             
extern double D_MAX = 1;             // 4小时5周期均线方差阈值
extern int qushi_level_MAX = 4;      // 4小时趋势强度阈值
extern int fast_move = 100;          // 快速跟踪止损点数
extern double mini_im = 0.01;        // 单次最小投资金额占总净值比例


## 交易逻辑

1. **入场条件**：
   - 技术指标金叉/死叉信号
   - 趋势强度达到阈值要求
   - 符合止损条件

2. **仓位大小**：
   - 5分钟周期：`qushi() * lots()`
   - 1小时周期：`2 * qushi() * lots()`
   - 4小时周期：`4 * qushi() * lots()`

3. **止损计算**：
   - 基于ATR值动态计算
   - 考虑近期最高/最低价
   - 参考移动平均线位置
   - 设置最大止损范围

## 趋势判断机制

策略使用`qushi()`函数评估市场趋势强度：

1. 首先计算4小时周期5根K线的均线方差
2. 判断5分钟周期的ATR值是否超过阈值
3. 综合评估K线、KD、MA、MACD和MA60等多个指标
4. 返回趋势强度绝对值，用于决定是否开仓和计算仓位大小

## 使用建议

- 适合波动较大的市场环境
- 建议在模拟账户上充分测试后再用于实盘交易
- 可根据不同交易品种调整参数设置
- 特别注意`ATR_MAX`和`D_MAX`参数，它们决定了策略是否识别为趋势市场

## 风险提示

- 该策略在震荡市场中可能频繁开仓，请谨慎使用
- 建议设置合理的资金管理比例，避免过度杠杆
- 定期检查策略表现，根据市场变化调整参数

## 版权信息

Copyright 2017, unclefx.