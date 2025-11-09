# 个人笔记网站

一个基于GitHub Pages的现代化个人笔记网站，支持搜索、标签筛选、匿名评论等功能。

## ✨ 功能特性

- 🏠 **首页展示** - 头像、个人信息、统计信息
- 📝 **笔记管理** - 展示所有笔记，支持分类和标签
- 🔍 **搜索功能** - 快速搜索笔记标题、内容和标签
- 🏷️ **标签筛选** - 点击标签快速筛选相关笔记
- 💬 **匿名评论** - 在笔记详情页发表匿名评论
- 🎨 **多主题切换** - 5种精美主题可选
- 📱 **响应式设计** - 完美适配各种设备
- 🚀 **静态网站** - 基于GitHub Pages，无需服务器

## 📁 项目结构

```
.
├── index.html          # 首页
├── notes.html          # 笔记列表页
├── note.html           # 笔记详情页
├── style.css           # 样式文件
├── script.js           # JavaScript功能
├── notes/              # 笔记目录
│   ├── notes.json      # 笔记索引文件
│   ├── note-001.md     # 笔记文件（可选）
│   └── ...
└── README.md           # 项目说明
```

## 🚀 快速开始

### 1. 创建GitHub仓库

1. 登录GitHub，创建新仓库，仓库名建议为 `yourusername.github.io`
2. 将项目文件上传到仓库

### 2. 配置GitHub Pages

1. 进入仓库 `Settings` 页面
2. 找到 `Pages` 选项
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`（或 `master`）
5. 点击 `Save` 保存

### 3. 访问网站

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
- **CSS3** - 样式和动画
- **Vanilla JavaScript** - 交互功能
- **GitHub Pages** - 静态网站托管
- **LocalStorage** - 本地评论存储

## 📌 注意事项

1. **评论功能** - 评论数据存储在浏览器本地，不同设备间不互通
2. **搜索功能** - 目前仅支持标题和内容搜索
3. **图片** - 如需添加图片，建议使用GitHub仓库存储或CDN链接
4. **更新频率** - 每次修改后需要重新部署才能生效

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
