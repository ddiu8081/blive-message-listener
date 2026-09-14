# SEND_GIFT_V2

`decoded_normal2.json` 至 `decoded_normal6.json` 是 PB 解码后的脱敏数据，遵循上一级 [Mock 规则](../README.md)。前四份是粉丝团灯牌，最后一份是幸运盲盒爆出的星光铃铛；保留了不同用户等级、粉丝牌和金额字段组合。

- 用户、主播及粉丝牌信息均替换为约定占位值，包括嵌套用户信息和头像。
- 交易标识 `tid`、连击标识 `batch_combo_id`、时间戳及累计花费字段 `rcost` 使用合成值，不保留可关联到原始交易的信息。
- 已知字段名参考 [blivedm PR #86 评论中的完整协议](https://github.com/xfgryujk/blivedm/pull/86)。`gift_list` 始终为数组；`field_N` 与 `_candidate` 保留尚未确认的字段及推断。`magnification` 使用协议指定的浮点值；其余未知固定 32 位字段保留整数值与浮点候选解释。
- 安全整数范围内使用 JSON number，超出范围的整数保留字符串。
- 未提交原始 Base64 PB 和含个人信息的解码报告。需要检查本地抓包时，可运行 `bun scripts/inspect-send-gift-v2.ts <capture.json>`；输出本身不自动脱敏。

测试使用这些 JSON 在内存中重建所需 PB 字段，不依赖原始抓包文件：

```sh
bun test tests/send-gift-v2.test.ts
```

字段修正：`gift_type → demarcation`、`rnd → batch_combo_id`、`field_6 → discount_price`、`field_11 → super_batch_gift_num`、`field_14 → combo_total_coin`（均指 gift_list 项）。顶层粉丝牌颜色与点亮字段也已命名，发送/接收用户结构使用 `sender_uinfo / receiver_uinfo`。`send_master` 位于顶层字段 7，`receive_user_info` 位于礼物项字段 29，不能互换。

参考 [BililiveRecorder PR #805](https://github.com/BililiveRecorder/BililiveRecorder/pull/805) 补充运行时行为测试：`switch` 控制礼物分发，空列表不产生虚构礼物，匿名身份保留顶层值，未知字段可跳过，字段编号和 64 位 varint 溢出会拒绝。测试数据在内存中构造，不包含原始身份。
