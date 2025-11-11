# Thunder's Blog 📝

一个基于 GitHub Pages 的静态博客系统，使用 GitHub API 作为后端存储，支持 HTML 编写，无需服务器即可搭建个人博客。

![博客预览](https://img.shields.io/badge/博客-版本1.0-blue.svg)
![GitHub](https://img.shields.io/badge/基于-GitHub%20Pages-green.svg)
![许可证](https://img.shields.io/badge/许可证-MIT-yellow.svg)

## ✨ 特性

### 🚀 核心功能
- **无需服务器** - 完全基于 GitHub Pages 构建
- **数据存储** - 使用 GitHub API 存储博客内容和评论
- **双格式支持** - 支持 Markdown 和 HTML 编写
- **实时搜索** - 支持标题、内容和标签搜索
- **标签分类** - 使用标签快速筛选内容
- **评论系统** - 基于 GitHub Issues 的评论功能
- **主题切换** - 四种精美主题可选

### 🎨 界面特性
- **响应式设计** - 完美适配桌面端和移动端
- **动画效果** - 流畅的页面过渡和交互动画
- **暗色主题** - 支持夜间模式
- **离线缓存** - 本地缓存提升加载速度
- **导航栏** - 可隐藏/显示的侧边导航栏

### 🛠️ 技术特性
- **纯前端** - 无需后端服务器
- **版本控制** - 博客内容自动纳入 Git 版本管理
- **安全加密** - GitHub Token 加密存储
- **快速部署** - 一键部署到 GitHub Pages
- **SEO 友好** - 内置 sitemap.xml 和 robots.txt

## 🛠️ 技术栈

- **前端框架**: 原生 HTML5 + CSS3 + JavaScript (ES6+)
- **样式技术**: CSS Grid、Flexbox、CSS 动画
- **数据存储**: GitHub API v3
- **页面托管**: GitHub Pages
- **代码高亮**: Marked.js
- **图标**: Font Awesome
- **主题系统**: CSS 变量 + LocalStorage

## 📦 项目结构

```
thunder.github.io/
├── index.html              # 首页
├── notes.html              # 博客列表页
├── write.html              # 写博客页
├── note.html               # 博客详情页
├── profile.html            # 个人信息页
├── style.css               # 主样式文件
├── config.js               # 配置文件
├── github-api.js           # GitHub API 操作
├── sitemap.xml             # 网站地图
├── robots.txt              # 爬虫协议
├── README.md               # 项目说明
└── notecontent/            # 博客内容目录
    ├── note-001.html       # 示例博客内容
    └── ...
```

## 🚀 快速开始

### 1. Fork 项目

点击页面右上角的 "Fork" 按钮，将项目复制到你的 GitHub 账户。

### 2. 配置 GitHub Token

#### 生成 Token
1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置权限：
   - ✅ `repo` (完整仓库权限)
   - ✅ `public_repo` (公开仓库访问)
4. 设置过期时间（建议 90 天）
5. 复制生成的 token

#### 配置 Token
运行加密脚本生成加密配置：
```bash
python3 .local_encrypt.py
```
```
注意：.local_encrypt.py需要用户自己创建(自定义加密方式,需要更改前端代码对应的解密方式)
```
复制输出的加密代码，替换各页面中的 `setupEncryptedToken` 配置。

> 📖 **详细使用指南**: 查看 [ENCRYPTION_GUIDE.md](doc/ENCRYPTION_GUIDE.md) 了解完整的加密配置流程、安全最佳实践和常见问题解答。

### 3. 启用 GitHub Pages

1. 进入仓库 `Settings` > `Pages`
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `main` 或 `gh-pages`
4. 点击 `Save`

### 4. 访问你的博客

等待几分钟后，访问 `https://你的用户名.github.io/你的仓库名/`

## 📝 如何写博客

### 方式一：在线编写

1. 访问博客首页
2. 点击 "写博客" 按钮
3. 填写博客信息：
   - **标题**：博客标题
   - **摘要**：简短描述
   - **标签**：用逗号分隔
   - **内容**：支持 HTML 或 Markdown
   - **修改密钥**：（可选）用于后续编辑
4. 点击 "发布博客"

### 方式二：手动创建

1. 在仓库根目录创建新的 `.html` 文件
2. 编写 HTML 内容
3. 提交到 GitHub

### 博客格式示例

```json
{
  "id": "note-001",
  "title": "我的第一篇博客",
  "content": "<p>这里是博客内容...</p>",
  "excerpt": "这是博客摘要",
  "tags": ["技术", "前端"],
  "date": "2025-11-12",
  "authorKey": null,
  "editKey": "optional-key",
  "type": "html",
  "comments": []
}
```

## ⚙️ 配置说明

### config.js 配置

```javascript
// 配置文件
const CONFIG = {
    avatar: "img/avatar.jpg",      // 头像路径
    name: "你的名字",               // 显示名称
    email: "your@email.com",       // 联系邮箱
    github: "your-github-username" // GitHub 用户名
};
```

### 主题配置

网站提供四种主题：
- **diary** - 米白日记（默认）
- **dark** - 夜间模式
- **paper** - 暖黄护眼
- **minimal** - 极简灰

主题自动保存到本地存储，用户下次访问时自动应用。

## 🔧 自定义配置

### 修改网站标题

编辑各 HTML 文件的 `<title>` 标签和导航栏文案。

### 修改主题颜色

编辑 `style.css` 文件中的 CSS 变量：

```css
:root {
    --primary: #667eea;      /* 主色调 */
    --accent: #764ba2;       /* 强调色 */
    --bg-primary: #ffffff;   /* 主背景 */
    /* 更多变量... */
}
```

### 添加新页面

1. 创建新的 HTML 文件
2. 参考现有页面的结构
3. 更新导航栏链接

---

## 💬 评论系统

### 工作原理

评论系统基于 GitHub Issues：
1. 用户发表评论
2. 基于你的加密token来推送评论内容到comments
4. 读取时从 GitHub API 获取

### 权限设置

确保你的 GitHub Token 具有以下权限：
- ✅ Repository: Full control of private repositories
- ✅ Issues: Full control

## 🎨 主题开发

### 添加新主题

1. 在 `style.css` 中定义新的主题变量：
```css
[data-theme="custom"] {
    --primary: #your-color;
    --bg-primary: #your-bg;
    /* 更多变量... */
}
```

2. 在 HTML 中添加主题选项：
```html
<div class="theme-option" data-theme="custom">
    <i class="fas fa-star"></i>
    <span>我的主题</span>
</div>
```


## 📊 性能优化

- ✅ 资源懒加载
- ✅ 图片压缩
- ✅ CSS/JS 压缩
- ✅ 缓存策略
- ✅ CDN 加速（使用 cdnjs）


## ❓ 常见问题

### Q: Token 加密有什么用？
A: 防止 Token 在前端暴露，提高安全性。虽然有技术背景的用户仍可能获取，但可以限制权限和设置过期时间。

### Q: 如何备份博客内容？
A: 所有内容都在 GitHub 上，自动版本控制。也可以定期导出仓库作为备份。

### Q: 如何禁用评论？
A: 在 `config.js` 中设置 `enableComments: false`，或在 `github-api.js` 中修改相关函数。

## 📜 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [GitHub Pages](https://pages.github.com/) - 免费托管服务

**⭐ 如果这个项目对你有帮助，请给它一个星标！**

Made with ❤️ by Thunder
