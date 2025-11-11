# 🔐 GitHub Token 加密使用指南

本指南详细说明如何使用内置的加密工具安全地配置 GitHub Token。

## 📋 目录

- [工作原理](#工作原理)
- [前置准备](#前置准备)
- [加密步骤](#加密步骤)
- [前端配置](#前端配置)
- [安全建议](#安全建议)
- [常见问题](#常见问题)

---

## 🎯 工作原理

### 加密流程

```
┌─────────────────────────────────────────┐
│              GitHub Token               │
│      (Personal Access Token)            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         用户输入加密密码                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    PBKDF2 密钥派生 (100,000 次迭代)     │
│         + 随机盐值 (16 字节)            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         AES-256-GCM 加密                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        生成前端配置代码                 │
│      (token, salt, iv, iterations)      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         嵌入 HTML 页面                  │
└─────────────────────────────────────────┘
```

### 安全特性

- ✅ **强加密算法**: AES-256-GCM
- ✅ **密钥派生**: PBKDF2-HMAC-SHA256 (100,000 次迭代)
- ✅ **随机盐值**: 每次加密使用不同的 16 字节盐值
- ✅ **随机 nonce**: AES-GCM 使用 12 字节随机 nonce
- ✅ **身份验证**: GCM 模式提供数据完整性验证

---

## 📦 前置准备

### 1. 安装 Python 依赖

```bash
pip install cryptography
```

### 2. 创建 GitHub Token

1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择权限：
   - ✅ `repo` - 完整仓库权限
   - ✅ `public_repo` - 公开仓库访问
   - ✅ `issues` - 问题管理
4. 设置过期时间（建议 90 天）
5. **复制生成的 Token**（只显示一次！）

---

## 🔒 加密步骤

### 运行加密脚本

```bash
python3 .local_encrypt.py
```

### 交互式输入

```
============================================================
🔐 GitHub Token 加密工具
============================================================

📝 步骤 1: 输入 GitHub Token
------------------------------------------------------------
请访问 https://github.com/settings/tokens 生成 Token
建议权限: repo, public_repo, issues

请输入 GitHub Token: ************************************
是否确认使用此 Token? (y/n): y

🔒 步骤 2: 设置加密密码
------------------------------------------------------------
请设置一个密码用于加密 Token
⚠️  请记住此密码，后续解密时需要使用

请输入加密密码: ********
请再次输入密码: ********

⚙️  步骤 3: 正在加密...
------------------------------------------------------------
✅ 加密成功!

📄 步骤 4: 生成配置代码
------------------------------------------------------------
✅ 配置生成成功!
```

### 输出示例

```javascript
// GitHub Token 加密配置
// 生成时间: a1b2c3d4
// 使用方法: 将此配置添加到 HTML 页面的 <script> 标签中

window.setupEncryptedToken({
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    iv: "xG7v8h9i0jK1lM2nO3pQ4r",
    salt: "S2l3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7a8b9c0d",
    iterations: 100000,
    password: "your-password"
});
```

---

## 🌐 前端配置

### 1. 添加到 HTML 页面

在引入 `github-api.js` **之前**添加配置：

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的博客</title>
</head>
<body>
    <!-- 页面内容 -->

    <!-- 1. 首先配置加密 Token -->
    <script>
        window.setupEncryptedToken({
            token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
            iv: "xG7v8h9i0jK1lM2nO3pQ4r",
            salt: "S2l3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7a8b9c0d",
            iterations: 100000,
            password: "your-password"
        });
    </script>

    <!-- 2. 然后引入 GitHub API -->
    <script src="github-api.js"></script>

    <!-- 页面其他脚本 -->
</body>
</html>
```

### 2. 检查加载状态

```javascript
// 监听 Token 加载完成事件
window.addEventListener('tokenLoaded', function() {
    console.log('✅ GitHub Token 已加载，可以开始使用 API');
    // 在这里可以初始化其他功能
});
```

---

## 💡 最佳实践

### ✅ 推荐做法

1. **使用强密码**
   - 至少 12 个字符
   - 包含大小写字母、数字和特殊字符
   - 不要使用常见密码

2. **定期更换 Token**
   - 设置 90 天过期时间
   - 到期前及时更新
   - 监控 Token 使用情况

3. **限制 Token 权限**
   - 只授予必要的最小权限
   - 使用 Fine-grained tokens（如果支持）

4. **妥善保管密码**
   - 密码不会存储在代码中
   - 请务必记住加密密码
   - 可以使用密码管理器

### ❌ 避免事项

1. **不要提交明文 Token**
   - 永远不要将未加密的 Token 提交到代码库
   - 不要在注释中包含 Token

2. **不要在公开仓库暴露配置**
   - 即使加密后，也不要提交到公开仓库
   - 私有仓库也建议使用环境变量

3. **不要使用弱密码**
   - 避免字典密码
   - 避免个人信息
   - 避免重复使用密码

---

## 🔍 常见问题

### Q1: 忘记了加密密码怎么办？

**A:** 无法恢复！这是设计特性。请：
1. 删除旧的加密配置
2. 使用原始 Token 重新加密
3. 设置新的密码

### Q2: 可以修改加密密码吗？

**A:** 不行，需要重新加密。步骤：
1. 重新运行 `.local_encrypt.py`
2. 使用相同 Token 但新密码
3. 更新前端配置

### Q3: 前端如何解密 Token？

**A:** 自动完成：
1. 用户访问网页
2. `setupEncryptedToken()` 被调用
3. 使用存储的密码和配置解密
4. 解密后的 Token 用于 GitHub API 调用

### Q4: Token 会被保存在本地吗？

**A:** 不会。Token 只在内存中，解密后立即使用，不会持久化存储。

### Q5: 可以在多个网站使用相同配置吗？

**A:** 可以，但建议不要：
- 不同网站使用不同 Token
- 降低安全风险
- 便于管理和撤销

### Q6: 加密配置泄露安全吗？

**A:** 相对安全：
- 需要密码才能解密
- PBKDF2 难以暴力破解
- 但仍建议定期更换

### Q7: 支持自定义迭代次数吗？

**A:** 支持，修改 Python 脚本中的 `iterations` 参数：
- 默认 100,000 次
- 增加迭代次数提高安全性
- 但会增加解密时间

---

## 🛠️ 高级配置

### 自定义迭代次数

```python
# 修改 .local_encrypt.py 第 34 行
def encrypt_token(token: str, password: str, iterations: int = 200000):
    # 增加到 200,000 次迭代
```

### 修改默认解密密码

编辑 `github-api.js` 第 80 行：

```javascript
getDecryptionPassword() {
    if (this.encryptedConfig && this.encryptedConfig.password) {
        return this.encryptedConfig.password;
    }
    return "你的自定义默认密码";  // 修改这里
}
```

### 调试模式

在浏览器控制台查看解密过程：

```javascript
// 启用详细日志
window.githubNoteManager.debug = true;

// 手动触发解密
await window.githubNoteManager.getDecryptedToken();
```

---

## 📊 性能对比

| 迭代次数 | 安全性 | 解密时间 |
|---------|--------|----------|
| 100,000 | 高     | ~100ms   |
| 200,000 | 很高   | ~200ms   |
| 500,000 | 极高   | ~500ms   |

**建议**: 100,000 次迭代是安全和性能的最佳平衡点。

---

## 🚨 应急处理

### 如果 Token 泄露

1. **立即撤销 Token**
   - 访问 [GitHub Tokens](https://github.com/settings/tokens)
   - 删除泄露的 Token

2. **清理恶意提交**
   - 检查仓库活动
   - 回滚恶意更改

3. **生成新 Token**
   - 创建新的 Token
   - 重新加密配置
   - 更新所有网站

4. **分析泄露原因**
   - 检查日志
   - 修复漏洞

### 如果密码泄露

1. **立即更新所有配置**
   - 生成新 Token
   - 设置新密码
   - 更新所有网站

2. **检查未授权访问**
   - 查看 GitHub 活动日志
   - 检查异常操作

---

## 📚 参考资源

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [PBKDF2 规范](https://tools.ietf.org/html/rfc2898)
- [AES-GCM 加密](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)
- [Cryptography 包文档](https://cryptography.io/)

---

## 💬 联系支持

如果遇到问题：

- 📧 邮箱: thunder153460@gmail.com
- 🐙 GitHub Issues: [创建 Issue](https://github.com/C6thunder/thunder.github.io/issues)

---

Made with ❤️ by Thunder
