# OpenClaw 多Agent 配置与群组免@设置

## 一、多Agent配置

### 1.1 什么是多Agent？

OpenClaw支持在单个Gateway中运行多个**隔离的Agent**，每个Agent拥有：
- **独立的工作空间**（workspace）：包含 AGENTS.md、SOUL.md、USER.md 等配置文件
- **独立的认证目录**（agentDir）：存储各自信任凭证
- **独立的会话存储**：历史消息和路由状态彼此隔离

### 1.2 创建多Agent

使用Agent向导创建：

```bash
openclaw agents add work
openclaw agents add social
```

或手动在配置文件中添加：

```json5
{
  agents: {
    list: [
      {
        id: "main",
        name: "主助手",
        workspace: "~/.openclaw/workspace-main",
        agentDir: "~/.openclaw/agents/main/agent",
      },
      {
        id: "coding",
        name: "Coding助手",
        workspace: "~/.openclaw/workspace-coding",
        agentDir: "~/.openclaw/agents/coding/agent",
      },
    ],
  },
}
```

### 1.3 绑定与路由规则

通过 `bindings` 将消息路由到对应的Agent。匹配规则（优先级从高到低）：

1. `peer` 匹配（精确的DM/群组/频道ID）
2. `parentPeer` 匹配（线程继承）
3. `guildId + roles`（Discord角色路由）
4. `guildId`（Discord）
5. `teamId`（Slack）
6. `accountId` 匹配
7. 通道级匹配
8. 回退到默认Agent

示例：按渠道分流

```json5
{
  agents: {
    list: [
      { id: "chat", workspace: "~/.openclaw/workspace-chat" },
      { id: "opus", workspace: "~/.openclaw/workspace-opus" },
    ],
  },
  bindings: [
    { agentId: "chat", match: { channel: "whatsapp" } },
    { agentId: "opus", match: { channel: "telegram" } },
  ],
}
```

示例：同一渠道，按特定群组分流

```json5
{
  bindings: [
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        peer: { kind: "group", id: "1203630...@g.us" },
      },
    },
  ],
}
```

### 1.4 多账号支持

同一渠道可配置多个账号（如多个WhatsApp号码、Telegram机器人）：

```json5
{
  channels: {
    telegram: {
      accounts: {
        default: { botToken: "123456:ABC..." },
        alerts: { botToken: "987654:XYZ..." },
      },
    },
  },
  bindings: [
    { agentId: "main", match: { channel: "telegram", accountId: "default" } },
    { agentId: "alerts", match: { channel: "telegram", accountId: "alerts" } },
  ],
}
```

### 1.5 Agent级别的沙箱与工具限制

可以为每个Agent配置独立的沙箱和工具权限：

```json5
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/.openclaw/workspace-personal",
        sandbox: { mode: "off" },
      },
      {
        id: "restricted",
        workspace: "~/.openclaw/workspace-restricted",
        sandbox: { mode: "all", scope: "agent" },
        tools: {
          allow: ["read", "sessions_list"],
          deny: ["exec", "write", "edit"],
        },
      },
    ],
  },
}
```

---

## 二、群组免@配置

### 2.1 飞书群组免@

飞书支持配置群组无需@即可响应：

```json5
{
  channels: {
    feishu: {
      groupPolicy: "open",
      groups: {
        "oc_xxx": { requireMention: false },
      },
    },
  },
}
```

**配置说明：**
- `groupPolicy`: `"open"` | `"allowlist"` | `"disabled"`
- `requireMention`: `true`（默认）| `false`
- 群组ID格式：`oc_xxx`

### 2.2 WhatsApp群组免@

```json5
{
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: false },
      },
    },
  },
}
```

### 2.3 Discord群组免@

```json5
{
  channels: {
    discord: {
      accounts: {
        default: {
          guilds: {
            "123456789012345678": {
              channels: {
                "222222222222222222": { allow: true, requireMention: false },
              },
            },
          },
        },
      },
    },
  },
}
```

### 2.4 激活模式

部分渠道支持两种激活模式：
- `mention`：仅当收到@提及时响应（默认）
- `always`：每条消息都唤醒Agent，但应只在有价值时回复，否则返回 `NO_REPLY`

WhatsApp示例：
```
/activation always   # 开启免@
/activation mention # 恢复需@
```

---

## 三、综合配置示例

### 示例：飞书群组多Agent + 免@

```json5
{
  agents: {
    list: [
      {
        id: "main",
        name: "主助手",
        workspace: "~/.openclaw/workspace-main",
        groupChat: {
          mentionPatterns: ["@小虾米"],
        },
      },
      {
        id: "coding",
        name: "编程助手",
        workspace: "~/.openclaw/workspace-coding",
        groupChat: {
          mentionPatterns: ["@代码助手"],
        },
      },
    ],
  },

  bindings: [
    { agentId: "main", match: { channel: "feishu", accountId: "default" } },
  ],

  channels: {
    feishu: {
      groupPolicy: "open",
      groups: {
        "oc_3fdbb751851996e40b78bd92305f3ec0": { requireMention: false },
      },
    },
  },
}
```

---

## 四、验证与调试

```bash
# 查看Agent列表及绑定
openclaw agents list --bindings

# 查看渠道状态
openclaw channels status --probe

# 启动日志跟踪
openclaw logs --follow
```

---

## 五、总结

| 功能 | 关键配置 |
|------|----------|
| 多Agent | `agents.list[].id`, `workspace`, `agentDir` |
| 消息路由 | `bindings` 数组，按优先级匹配 |
| 多账号 | `channels.<channel>.accounts` |
| 群组免@ | `channels.<channel>.groups.<id>.requireMention: false` |
| Agent隔离沙箱 | `agents.list[].sandbox.mode` |
| 工具限制 | `agents.list[].tools.allow/deny` |

通过以上配置，可以实现：
1. **多Agent隔离**：不同Agent拥有独立人格和认证
2. **灵活路由**：按渠道、群组、账号精准分流
3. **群组免@**：特定群组无需@即可响应
4. **安全隔离**：通过沙箱和工具限制保障安全
