# SEND_GIFT_V2

`decoded_normal2.json` 至 `decoded_normal6.json` 是 PB 解码后的脱敏数据，遵循上一级 [Mock 规则](../README.md)。前四份是粉丝团灯牌，最后一份是幸运盲盒爆出的星光铃铛；保留了不同用户等级、粉丝牌和金额字段组合。

- 用户、主播及粉丝牌信息均替换为约定占位值，包括嵌套用户信息和头像。
- 交易标识 `tid`、随机标识 `rnd`、时间戳及未知流水字段 `field_24` 使用合成值，不保留可关联到原始交易的信息。
- 已知字段名参考 [blivedm PR #86 最终协议](https://github.com/hqrrr/blivedm/blob/dcd99f0d1bafe44210c0dffc785eaea635705e26/blivedm/models/pb.py)。`gift_list` 始终为数组；`field_N` 与 `_candidate` 保留尚未确认的字段及推断。固定 32 位字段保留整数值与浮点候选解释。
- 安全整数范围内使用 JSON number，超出范围的整数保留字符串。
- 未提交原始 Base64 PB 和含个人信息的解码报告。需要检查本地抓包时，可运行 `bun scripts/inspect-send-gift-v2.ts <capture.json>`；输出本身不自动脱敏。

测试使用这些 JSON 在内存中重建所需 PB 字段，不依赖原始抓包文件：

```sh
bun test tests/send-gift-v2.test.ts
```
