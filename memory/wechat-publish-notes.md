# 微信公众号发布经验总结

## 1. Frontmatter 格式（必填）
```markdown
---
title: 文章标题
cover: 网络图片URL或已上传到微信图床的图片URL
---
```

## 2. 图片要求
- ✅ 网络URL（如微信图床）：`http://mmbiz.qpic.cn/...`
- ❌ 本地路径（如 `./assets/xx.jpg`）：会报错 "unsupported file type hint"
- ❌ 本地二维码路径：需要替换为网络URL

## 3. 发布命令
```bash
export WECHAT_APP_ID=wx724e23bf2f74e16e
export WECHAT_APP_SECRET=f82e5ea67630a21270181c1f02343294
wenyan publish -f <文件> -t lapis -h solarized-light
```

## 4. 常见错误
- 40113: 图片是本地路径 → 换成网络URL
- 41005: access_token 过期 → 重新获取

## 5. 凭证（已配置）
- WECHAT_APP_ID: wx724e23bf2f74e16e
- WECHAT_APP_SECRET: f82e5ea67630a21270181c1f02343294

## 6. 编写文章注意事项
- ✅ 头图必须插入文章正文（在"正文第一段"之后、"步骤简介"之前），使用 `![头图](./imgs/cover-img.jpg)` 格式
- ✅ 这是 article-pattern.md 模板明确要求的，不要遗漏！
- ✅ 二维码图片也需要放到 article.md 同级目录
