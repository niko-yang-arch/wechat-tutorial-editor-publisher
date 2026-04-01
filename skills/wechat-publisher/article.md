---
title: 不写一行代码、不花一分钱，打造专属本地聊天机器人，小白也能操作
cover: ./assets/cover.jpg
---

### 不写一行代码、不花一分钱，打造专属本地聊天机器人，小白也能操作（Dify + Trae）

大家好，好久不见，我是AI旋转矩阵，今天介绍一种方法，不写一行代码、不花一分钱，也能打造个人专属聊天机器人。

#### 步骤及思想

- 本地安装WSL
- 安装Docker Desktop
- 安装操作Dify
- 运行Docker环境
- 本地启动Dify
- 本地搭建聊天Agent
- 安装AI集成开发环境Trae
- 让Trae Builder帮你写一个html页面
- 嵌入Bot

#### 实现

1. **本地安装WSL**：

   WSL是在Windows系统开辟一个窗口，在该窗口内可以执行Linux命令操作。

   安装方法请参考微软官方教程：[如何使用 WSL 在 Windows 上安装 Linux](https://learn.microsoft.com/zh-cn/windows/wsl/install)

2. **下载安装Docker**：

   根据Docker官方文档指导下载安装Docker Desktop: [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/#wsl-2-backend)

3. **安装操作Dify**:

   3.1 前往Github下载Dify：[Dify on Github](https://github.com/langgenius/dify)

   3.2 进入项目根目录找到docker文件夹

   3.3 .env文件重命名

    3.4 右键打开命令行

4. 运行Docker环境

   ```
   docker compose up -d
   ```

5. 本地启动Dify

   在浏览器地址栏输入：

   ```
   http://127.0.0.1/install
   ```

   首次登录需进行注册。

   dify的主界面如下所示：

6. 本地搭建聊天Agent

   6.1 创建空白应用

   6.2 创建聊天助手

6.3 编辑提示词并选择模型

所有模型目前均免费调用，笔者选择的是qwen2.5-7b-instruct，你可以选择你喜欢的模型。

我的提示词如下：

```
## 角色设定
- 你是一名心灵疗愈机器人，擅长为用户提供疗愈、陪伴、鼓励服务。
## 任务分配
在聊天过程中，你作为一名疗愈类机器人，你需要认真倾听用户的烦恼、吐槽，甚至情绪发泄。理解用户的字面意思和背后用意。**注意**：不要擅自发表见解，尽量顺着用户的意思聊天。
**ATTENTION**：不要盲目为用户提出建议，除非用户要求。
```

你可以编辑你自己的提示词（尽量使用Mark Down语法）。

6.4 测试与Bot聊天

6.5 发布应用

**注意**：应用发布不是必须，但如果不发布，容易造成数据丢失，所以这里尽量点击发布。

7. 安装AI集成开发环境Trae

   Trae是字节跳动旗下一款AI集成开发环境，自身基于开源IDE Visual Studio Code构建，不久前开放了国内版SOLO模式，供开发者免费使用。我们在官网指定位置下载国内版即可（也可用梯子自行下载国际版，但SOLO模式需付费使用）：[Trae官网地址](https://www.trae.cn/?utm_source=content&utm_medium=agentshare)

8. 让Trae Builder帮你写一个html页面

   8.1 创建目录

   在本地创建一个文件夹，我创建了一个名为liaoyu-bot的目录。（**注意**：文件夹命名一定是英文，可用横杠、下划线等符号连接）

   在Trae中打开如下图所示：

   8.2 让Trae Builder（或其它Trae Agent）创建html页面：

   Ctrl + I 打开AI对话界面，选择Agent

由于我安装了Frontend Architect前端架构Agent，所以采用的是它。如果你没安装，可以用Builder或SOLO Coder，在简单页面表现力相差无几。

接下来让AI前端架构师创建一个html页面并写好基础代码：

提示词如下：

```
在当前目录下创建一个名为tutorial.html的页面并编写基础html与css代码，要求：一个蓝色色块宽度80%，高度100%，水平居中。
```

浏览器打开：

完成基础html页面：

9. 嵌入Bot

   回到Dify工作室，点击发布按钮下的"嵌入网站"：

   拷贝iframe代码：

   粘贴至自己的<div></div>标签之间：

   保存代码并刷新浏览器：

这样我们就将自己在Dify创建的Bot嵌入了本地网页。你需要先去除原先block的蓝色背景色，同时将页面样式调美观些，你可以编辑提示词，让AI前端架构师修改页面样式（注意引用上下文）：

```
将原先block的蓝色背景色去除。此外页面样式不好看，你帮我改美观一些，title叫做疗愈机器人。
```

保存AI修改后的代码，刷新页面：

大功告成！

你也可以购买域名，将页面发布到公网上，或让AI编写移动端代码，注册小程序，发布到小程序。你可以继续咨询AI，这里就不做过多介绍了。希望本文能令你有所收获！
