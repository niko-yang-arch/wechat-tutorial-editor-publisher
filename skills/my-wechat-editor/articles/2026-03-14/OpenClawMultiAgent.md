---
title: OpenClaw 多智能体实战：飞书群聊机器人部署全流程
cover: http://mmbiz.qpic.cn/sz_mmbiz_jpg/jZJTe8vd74lYzbQqnVtPyRv8AvTHdzXO2Fib4KZPVH8IoUTRhZW69XFia514SkU1Bl9vCMBqywK8iaVChZjtjabRzvib7BiavB9upRrtnJAK6Iqk/0?from=appmsg
---

大家好！我是旋转矩阵

本文详细介绍如何在 OpenClaw 中创建多智能体，并将机器人接入飞书群聊，实现无需@即可直接对话的自动化助手。

![头图](http://mmbiz.qpic.cn/sz_mmbiz_jpg/jZJTe8vd74lYzbQqnVtPyRv8AvTHdzXO2Fib4KZPVH8IoUTRhZW69XFia514SkU1Bl9vCMBqywK8iaVChZjtjabRzvib7BiavB9upRrtnJAK6Iqk/0?from=appmsg)

## 提纲

- 创建智能体
- 配置 openclaw.json
- 创建飞书机器人
- 关联 Agent 与 Account
- 将机器人加入群组

## 1. 创建智能体

打开终端，执行以下命令创建智能体：

```bash
openclaw agents add coder
```

其中 `coder` 是你为智能体命名的名称，可根据需求自定义。

按照提示完成智能体的基础配置：

![创建智能体](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74kI3jOQRr4NekwH5EdnqiaSZ5ibnawIz9Tff7USoMC0bqgBrugRBl63QvpzcJZ9oPlyptzZ8QYwYg0R8ezeqmOuw8B5AASk1perU/0?from=appmsg)

飞书相关配置可以先跳过，后续在 JSON 文件中配置：

![飞书配置跳过](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74klEhfomPHaRHtGWTBaticdRq7OxwQlxWcpwc3t3sq2c99PYBd8pyRhunDNvZqeicIj3RgdU8HDZwyfDnA0W2qib818lOicKfguROc/0?from=appmsg)

智能体创建完成后，系统会生成对应的配置文件和目录结构。

## 2. 配置 openclaw.json

打开 `openclaw.json` 文件，定位到 `agents -> list` 节点，可以看到新增的智能体 `Coder`：

![查看JSON配置](http://mmbiz.qpic.cn/sz_mmbiz_jpg/jZJTe8vd74lO5nlPn7pUCJWd49v0BdryhyLU9AQlfzqNUnqJ4mGdAIjjtlxicbW9sjHXncFKDHFUPNXX9WTfS6njfXkxv6PyL1gb6UOiaFRaU/0?from=appmsg)

## 3. 创建飞书机器人

### 3.1 创建应用

登录飞书开放平台，创建一个新的企业自建应用。

### 3.2 配置权限

权限配置建议选择官方文档中最全面的权限集，为后续群消息回应做准备。参考配置如下：

```json
{
  "scopes": {
    "tenant": [
      "aily:file:read",
      "aily:file:write",
      "application:application.app_message_stats.overview:readonly",
      "application:application:self_manage",
      "application:bot.menu:write",
      "cardkit:card:write",
      "contact:user.employee_id:readonly",
      "corehr:file:download",
      "docs:document.content:read",
      "event:ip_list",
      "im:chat",
      "im:chat.access_event.bot_p2p_chat:read",
      "im:chat.members:bot_access",
      "im:message",
      "im:message.group_at_msg:readonly",
      "im:message.group_msg",
      "im:message.p2p_msg:readonly",
      "im:message:readonly",
      "im:message:send_as_bot",
      "im:resource",
      "sheets:spreadsheet",
      "wiki:wiki:readonly"
    ],
    "user": ["aily:file:read", "aily:file:write", "im:chat.access_event.bot_p2p_chat:read"]
  }
}
```

### 3.3 发布并记录凭证

创建完成后发布机器人，记录好 `app_id` 和 `app_secret`：

![记录AppID](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74nBmkj7e26ySNQHmyvY00LiaVep8bkRYDbULpXpnp71Yt0Avzd2NWrKzQUk4icIoaAmhedE2qwSTL2gmP6FXlia3guE8ehn5u5icms/0?from=appmsg)

![记录AppSecret](http://mmbiz.qpic.cn/sz_mmbiz_jpg/jZJTe8vd74k6trTMomzc5KsEksYKc5Kk1mjiaTOCdreqX5EbEfw07hwtcKC9Il9ianWGm6B7jjNteRYh9q6rkNVy8U8qFvl0AcjhpBFN9OPrw/0?from=appmsg)

### 3.4 创建长连接

在飞书开放平台机器人页面创建长连接事件和长连接回调，用于 WebSocket 连接：

![创建长连接](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74kvcf6zibSj0lYAqz7FH088MibwDgRLYLNXicBwflia1c0ia5EsKcaQPWs0yuTefBAAdsnkUmRJ1icxwwicT11X0wRWqd9njQVGY2vPxk/0?from=appmsg)

完成以上步骤后，发布机器人。

## 4. 关联 Agent 与 Account

打开 `openclaw.json` 文件，添加一组元素，将 Agent 与飞书账户进行关联：

![关联配置](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74mf9X4Lbj04MauFKZLdQHIhRibBPCLew6AUbicQt3d1IkOvS0zrAnuIv1KNDT6Micb88NBWLsA1c3lyr65puaV4O6Ekibpcomia9RUE/0?from=appmsg)

## 5. 将机器人加入群组

### 5.1 创建飞书群组

在飞书创建一个新的群组，记录好会话 ID：

![创建群组](http://mmbiz.qpic.cn/sz_mmbiz_jpg/jZJTe8vd74micunBH7QmjYxDEo1HFib4jxBXoG4B6ameF9I8NMFjtI06ZbmqgRO9Dsq69A3SlxPp14Jm1xibqVGjPMH1u7rE5icic4UmnzNKLEYE/0?from=appmsg)

### 5.2 配置会话信息

添加群组会话 ID，将 `requireMention` 设置为 `false`：

![配置会话](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74kOqOoN6YhzP73jKia1v4awI1sbUq17faY8y51WovHAXIRnlnZ7g3CQ8oNuYicfbCLVPsFJQm78w70LeyvwtiaaeCa3bgxLhFfDqE/0?from=appmsg)

### 5.3 加入群组

将机器人加入群组：

![加入群组](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74lVrLvcOxfKibTPBY6gIe2Jb2cwEu41qgibPWjJ8Cw7qAtxcQ1cfgicdUKiaqAGBQ8CBdGOebtFT198dkjM66DbXB7MicRGxljuE6ibM/0?from=appmsg)

大功告成！

此时，你可以直接在飞书群组中与机器人聊天，无需@机器人，机器人会自动响应。

## 6. 总结

本文详细介绍了 OpenClaw 多智能体的创建与飞书群聊机器人的部署流程。通过创建独立的 Agent，你可以为不同场景配置专属的 AI 助手；通过飞书机器人接入，团队成员可以在群聊中直接使用 AI 能力，无需复杂的操作。

每个机器人拥有独立的工作区，存放其身份信息文件和技能目录。根目录下的 `skill` 目录存放所有 Agent 可共享的技能，方便统一管理和复用。

祝你通过 OpenClaw 早日创建专属的一人公司！

---

关于作者：算法架构师转型AI全栈独立开发中。

欢迎同行及AI技术爱好者添加个人好友。

![二维码](http://mmbiz.qpic.cn/mmbiz_jpg/jZJTe8vd74kI3jOQRr4NekwH5EdnqiaSZ5ibnawIz9Tff7USoMC0bqgBrugRBl63QvpzcJZ9oPlyptzZ8QYwYg0R8ezeqmOuw8B5AASk1perU/0?from=appmsg)
