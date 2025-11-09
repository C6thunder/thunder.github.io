# ⚙️ 配置说明

## 🎯 登录后跳转配置

### 默认配置
当前设置：`/blog.html`
- 邮箱登录 → 跳转到 `blog.html?email=用户邮箱`
- 社交登录 → 跳转到 `blog.html?email=social:google@login.com`

---

## 🔧 修改跳转链接

### 方法1：编辑 `script.js`（推荐）

打开 `script.js`，找到第207行：

```javascript
// 在 BlogLogin 类的构造函数中
this.BLOG_HOME_URL = '/blog.html'; // 修改这里
```

**修改示例：**
```javascript
// 示例1：跳转到相对路径
this.BLOG_HOME_URL = '/dashboard.html';

// 示例2：跳转到完整URL
this.BLOG_HOME_URL = 'https://yourblog.com/home';

// 示例3：跳转到外部域名
this.BLOG_HOME_URL = 'https://blog.yourname.com';
```

### 方法2：使用查询参数动态配置

在 `index.html` 中添加一个隐藏字段：

```html
<script>
    // 动态设置跳转URL
    const BLOG_CONFIG = {
        homeUrl: '/your-blog-home.html' // 在这里修改
    };
</script>
```

然后在 `script.js` 中使用：

```javascript
this.BLOG_HOME_URL = window.BLOG_CONFIG?.homeUrl || '/blog.html';
```

---

## 🌐 不同部署环境的配置

### 部署到 Netlify

如果你的项目结构是：
```
project/
├── index.html
├── blog.html
└── ...
```

**推荐配置：**
```javascript
this.BLOG_HOME_URL = '/blog.html';
```

### 部署到子路径

如果你的网站在子路径下：
`https://example.com/myblog/`

**配置：**
```javascript
this.BLOG_HOME_URL = '/myblog/blog.html';
```

### 部署到 GitHub Pages

如果仓库名是 `username.github.io`：
**配置：**
```javascript
this.BLOG_HOME_URL = '/blog.html';
```

如果仓库名是其他名称：
**配置：**
```javascript
this.BLOG_HOME_URL = '/repository-name/blog.html';
```

---

## 🎨 自定义博客首页

### 使用提供的模板

项目中已包含 `blog.html` 模板，包含：
- ✅ 登录成功提示
- ✅ 用户信息显示
- ✅ 跳转按钮
- ✅ 响应式设计

### 修改博客首页

1. **编辑 `blog.html`** 来自定义页面
2. **修改样式** 在 `<style>` 标签中
3. **添加功能** 在 `<script>` 标签中

### 禁用跳转

如果你不想自动跳转，修改 `script.js`：

```javascript
showSuccessState() {
    // ... 其他代码 ...
    setTimeout(() => {
        // 禁用跳转，改为显示消息
        alert('登录成功！可以开始使用博客了。');
        this.resetLoginButton();
        loginForm.style.display = 'block';
        loginSuccess.style.display = 'none';
    }, 2000);
}
```

---

## 📊 社交登录配置

### Google 登录

当前是模拟登录，不会真正跳转到 Google。

**如果需要真实 Google 登录：**

1. 注册 Google OAuth 应用
2. 获取 Client ID
3. 使用 Google 登录 API

```javascript
// 示例代码
function initGoogleLogin() {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: handleGoogleResponse
    });
}
```

### GitHub 登录

类似地，需要：
1. 注册 GitHub OAuth 应用
2. 获取 Client ID 和 Secret
3. 使用 GitHub 登录 API

---

## 💡 常见问题

### Q: 跳转后页面显示 404？
A: 检查 `BLOG_HOME_URL` 是否正确，确保文件存在

### Q: 邮箱参数没有传递？
A: 检查博客首页是否正确接收 URL 参数

### Q: 社交登录跳转错误？
A: 检查 `showSocialSuccessState` 方法中的邮箱格式

### Q: 想跳转到外部链接？
A: 使用完整 URL：
```javascript
this.BLOG_HOME_URL = 'https://external-blog.com';
```

---

## 🔄 完整配置示例

### 1. 邮箱登录 + 外部博客

```javascript
this.BLOG_HOME_URL = 'https://myblog.wordpress.com';
```

### 2. 社交登录 + 自定义页面

```javascript
this.BLOG_HOME_URL = '/dashboard.html';
```

### 3. 开发环境配置

```javascript
// 根据环境自动切换
this.BLOG_HOME_URL = location.hostname === 'localhost'
    ? 'http://localhost:3000/blog'
    : '/blog.html';
```

---

## ✅ 检查清单

- [ ] 已修改 `BLOG_HOME_URL` 为正确的跳转地址
- [ ] 跳转页面文件存在且可访问
- [ ] 测试邮箱登录跳转
- [ ] 测试 Google 登录跳转
- [ ] 测试 GitHub 登录跳转
- [ ] 邮箱参数正确传递

---

**配置完成后，重新部署即可生效！** 🚀