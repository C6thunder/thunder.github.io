# 个人笔记网站

一个基于GitHub Pages的现代化个人笔记网站，支持搜索、标签筛选、云端匿名评论等功能。

## ✨ 功能特性

- 🏠 **首页展示** - 炫酷开始页面，粒子动画效果
- 📝 **笔记管理** - 展示所有笔记，支持分类和标签
- ✍️ **写笔记** - 在线的Markdown编辑器
- 🔍 **搜索功能** - 快速搜索笔记标题、内容和标签
- 🏷️ **标签筛选** - 点击标签快速筛选相关笔记
- 💬 **匿名评论** - 云端存储的匿名评论系统（保存到GitHub仓库）
- 🔐 **加密Token** - 使用AES-GCM加密保护token安全
- 🎨 **多主题切换** - 5种精美主题可选
- 📱 **响应式设计** - 完美适配各种设备
- ☁️ **GitHub集成** - 笔记和评论自动保存到GitHub仓库
- 🚀 **静态网站** - 基于GitHub Pages，无需服务器

## 📁 项目结构

```
.
├── index.html                  # 首页（炫酷开始页面）
├── notes.html                  # 笔记列表页
├── note.html                   # 笔记详情页（支持评论）
├── write.html                  # 写笔记页
├── setup.html                  # GitHub配置页
├── github-api.js               # GitHub API集成（含加密token支持）
├── style.css                   # 样式文件（5种主题）
├── script.js                   # JavaScript功能
├── notes/                      # 笔记目录
│   ├── notes.json              # 笔记索引文件
│   ├── note-001.json           # 笔记文件
│   └── ...
├── comments/                   # 评论目录（自动创建）
│   ├── comment-xxx.json        # 评论文件
│   └── ...
├── local/                      # 本地工具和脚本（不提交）
│   └── .local_encrypt.py       # 加密脚本
├── .gitignore                  # Git忽略文件
├── ENCRYPTED_TOKEN_EXAMPLE.html # 加密token使用示例
├── ENCRYPTION_SECURITY.md      # 安全说明
├── SETUP_GUIDE.md              # 详细设置指南
└── README.md                   # 项目说明
```

## 🚀 快速开始

### 1. 创建GitHub仓库

1. 登录GitHub，创建新仓库，仓库名建议为 `yourusername.github.io`
2. 将项目文件上传到仓库

### 2. 创建GitHub Fine-grained Token

1. 访问 [GitHub Settings](https://github.com/settings/tokens?type=beta) 创建Fine-grained token
2. 权限设置：只允许写入`comments/`目录
3. **复制token**（只显示一次！）

### 3. 配置加密Token

**⚠️ 重要：这是让所有用户都能匿名评论的关键步骤！**

1. 安装Python依赖：`pip install cryptography`
2. 运行加密脚本：`python3 local/.local_encrypt.py`
3. 输入您的token和加密密码
4. 复制输出的配置代码
5. 打开 `note.html`，找到第391-402行，替换为您的配置

详细步骤请参考：[SETUP_GUIDE.md](./SETUP_GUIDE.md)

### 4. 配置GitHub Pages

1. 进入仓库 `Settings` 页面
2. 找到 `Pages` 选项
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`（或 `master`）
5. 点击 `Save` 保存

### 5. 访问网站

等待几分钟后，访问 `https://yourusername.github.io` 即可看到网站

## 📝 添加笔记

### 方法一：修改notes.json

编辑 `notes/notes.json` 文件，在 `notes` 数组中添加新笔记：

```json
{
  "id": "note-006",
  "title": "新笔记标题",
  "date": "2025-11-10",
  "excerpt": "笔记摘要",
  "tags": ["标签1", "标签2"],
  "content": "笔记正文内容，支持Markdown格式"
}
```

### 方法二：创建独立笔记文件

1. 在 `notes/` 目录创建新的Markdown文件
2. 在 `notes.json` 中添加对应的索引条目

## 🎨 自定义配置

### 更换头像

编辑 `index.html` 文件中的头像URL：

```html
<img src="https://avatars.githubusercontent.com/uYOUR_ID?v=4" alt="个人头像" class="avatar">
```

### 修改个人信息

在 `index.html` 中修改：

- 标题：第57-58行
- 个人简介：第60行
- 头像URL：第54行

### 添加新主题

在 `style.css` 中添加新的主题变量：

```css
[data-theme="your-theme"] {
    --primary: #你的主色;
    --secondary: #你的辅助色;
    --accent: #你的强调色;
    /* ... 其他变量 */
}
```

然后在HTML中为按钮添加主题选项。

## 🔧 技术栈

- **HTML5** - 语义化标记
- **CSS3** - 样式和动画，玻璃拟态效果
- **Vanilla JavaScript** - 交互功能，Web Crypto API
- **GitHub Pages** - 静态网站托管
- **GitHub API** - 笔记和评论云端存储
- **Web Crypto API** - 前端token解密（AES-GCM + PBKDF2）
- **Fine-grained Tokens** - 细粒度权限控制

## 📌 注意事项

1. **评论功能** - 评论自动保存到GitHub仓库，支持云端同步
2. **加密Token** - 使用AES-GCM加密保护token，但前端解密仍有被逆向风险
3. **Token安全** - 定期更换token（建议90天），仅授予最小权限
4. **搜索功能** - 目前仅支持标题和内容搜索
5. **图片** - 如需添加图片，建议使用GitHub仓库存储或CDN链接
6. **更新频率** - 每次修改后需要重新部署才能生效

## 🔐 安全说明

- **详细安全分析**：请查看 [ENCRYPTION_SECURITY.md](./ENCRYPTION_SECURITY.md)
- **使用示例**：请查看 [ENCRYPTED_TOKEN_EXAMPLE.html](./ENCRYPTED_TOKEN_EXAMPLE.html)
- **完整设置指南**：请查看 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🎯 使用建议

1. **定期备份** - 笔记数据建议定期备份
2. **版本控制** - 利用Git管理笔记版本
3. **内容规划** - 建议建立统一的标签体系
4. **访问统计** - 可集成Google Analytics等工具

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题，请通过GitHub Issues联系。

---

**享受写作，记录生活！** ✨
