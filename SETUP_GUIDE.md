# 🚀 网站部署指南

## 📋 快速开始

按照以下步骤，您将能够使用加密的token为所有用户提供匿名评论功能。

## 第一步：创建GitHub Fine-grained Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. 点击 "Generate new token" > "Generate new token (beta)"
3. 填写token信息：
   - **Token name**: `NoteCommentToken`（或任意名称）
   - **Expiration**: 选择过期时间（建议90天）
   - **Resource access**: Select repositories
   - **Repository permissions**:
     - Contents: Read and Write
     - Metadata: Read
4. 创建完成后，**立即复制token**（只显示一次！）

## 第二步：安装Python依赖

```bash
pip install cryptography
```

## 第三步：生成加密配置

在项目根目录运行：

```bash
python3 local/.local_encrypt.py
```

按提示输入：
1. 您的GitHub Fine-grained token
2. 加密密码（8位以上，**请记住这个密码**）

脚本会输出类似这样的配置代码：

```javascript
window.setupEncryptedToken({
    token: "加密的token数据",
    salt: "加密的盐值",
    iterations: 100000
});
```

## 第四步：配置到网站

1. 打开 `note.html` 文件
2. 找到第391-402行的注释区域：
   ```html
   <!-- 加密Token配置 - 将此部分替换为Python脚本生成的配置 -->
   <script>
       // TODO: 运行 python3 local/.local_encrypt.py 生成配置
       // 然后将输出中的配置代码粘贴到这里
       // 示例配置（请替换为真实的加密数据）：
       /*
       window.setupEncryptedToken({
           token: "加密的token数据",
           salt: "加密的盐值",
           iterations: 100000
       });
       */
   </script>
   ```

3. **删除** `/*` 和 `*/`，**取消注释**，并替换为您的配置：
   ```html
   <script>
       window.setupEncryptedToken({
           token: "您的加密token",
           salt: "您的加密盐值",
           iterations: 100000
       });
   </script>
   ```

## 第五步：测试功能

1. 在浏览器中打开 `note.html`（通过GitHub Pages或本地服务器）
2. 查看浏览器控制台，应该看到：
   ```
   ✅ 已从加密配置加载token
   ✅ GitHub Note Manager 初始化完成
   ✅ 已加载加密token，用户可直接评论
   ```

3. 测试发表评论功能
4. 检查GitHub仓库的`comments/`目录，应该能看到新提交的评论文件

## 第六步：部署到GitHub Pages

1. 提交代码到GitHub仓库：
   ```bash
   git add .
   git commit -m "Add encrypted token for anonymous comments"
   git push
   ```

2. 在GitHub仓库的Settings > Pages中启用GitHub Pages
3. 访问您的网站：https://yourusername.github.io/thunder.github.io/

## ✅ 完成！

现在所有用户都可以进行匿名评论，无需配置自己的token。

## 🔍 验证评论功能

访问任意笔记详情页，尝试发表评论：
- 访问：https://yourusername.github.io/thunder.github.io/note.html?id=note-1
- 填写评论内容
- 点击"发表评论"
- 评论会自动保存到GitHub仓库的`comments/`目录

## 🛠️ 文件结构

```
thunder.github.io/
├── .gitignore                  # ✅ 已创建
├── .local_encrypt.py          # ✅ 本地加密脚本（不提交）
├── note.html                  # ✅ 需要添加加密配置
├── github-api.js              # ✅ 已支持加密token
├── ENCRYPTED_TOKEN_EXAMPLE.html # ✅ 详细使用示例
├── ENCRYPTION_SECURITY.md     # ✅ 安全说明
├── index.html                 # ✅ 首页
├── notes.html                 # ✅ 笔记列表
├── write.html                 # ✅ 写笔记页
└── setup.html                 # ✅ GitHub配置页
```

## ⚠️ 安全提醒

1. **定期更换token**：建议每90天更换一次
2. **最小权限**：token只允许写入`comments/`目录
3. **监控使用**：定期检查GitHub审计日志
4. **快速撤销**：如果token泄露，立即在GitHub中撤销
5. **不要提交敏感文件**：
   - .local_encrypt.py
   - encrypted_config.json
   - 任何包含未加密token的文件

## 🔄 更换token流程

如果需要更换token：
1. 在GitHub生成新的Fine-grained token
2. 重新运行 `python3 local/.local_encrypt.py`
3. 更新 `note.html` 中的配置
4. 提交并部署
5. 在GitHub中撤销旧token

## 📞 故障排除

### Q: 提示"Token解密失败"
A:
- 检查配置代码是否正确复制
- 确认密码和加密时的密码一致
- 检查浏览器控制台的详细错误信息

### Q: 提交评论失败
A:
- 确认token有写入仓库的权限
- 检查网络连接
- 查看浏览器控制台的错误信息

### Q: 如何确认token有效？
A:
- 运行脚本解密测试：`python3 -c "from .local_encrypt import decrypt_token; print(decrypt_token(data, 'your_password'))"`
- 或在浏览器控制台运行：`await githubNoteManager.getDecryptedToken()`

## 📚 相关文档

- [加密Token使用示例](./ENCRYPTED_TOKEN_EXAMPLE.html) - 详细的使用说明
- [安全说明](./ENCRYPTION_SECURITY.md) - 风险分析和最佳实践
- [GitHub Fine-grained Tokens文档](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-fine-grained-personal-access-token)

---

**🎉 恭喜！您的个人笔记网站现在已经支持匿名评论了！**
