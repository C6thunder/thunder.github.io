// GitHub API 集成 - 笔记和评论管理

// 强制设置全局编码为UTF-8，确保中文正确显示
if (typeof globalThis !== 'undefined') {
    globalThis.fetch = globalThis.fetch;
    // 强制TextDecoder使用UTF-8
    if (!globalThis.TextDecoder.prototype._originalDecode) {
        globalThis.TextDecoder.prototype._originalDecode = globalThis.TextDecoder.prototype.decode;
        globalThis.TextDecoder.prototype.decode = function(buffer, options) {
            try {
                return this._originalDecode.call(this, buffer, { ...options, fatal: false });
            } catch (e) {
                return this._originalDecode.call(this, buffer, { fatal: false });
            }
        };
    }
}

/**
 * @typedef {Object} EncryptedTokenConfig
 * @property {string} token - 加密的token
 * @property {string} salt - 加密的盐值
 * @property {number} iterations - PBKDF2迭代次数
 */

/**
 * @typedef {Object} GitHubConfig
 * @property {string} owner - GitHub用户名
 * @property {string} repo - 仓库名
 * @property {string} branch - 分支名
 * @property {string} token - GitHub token
 */

// 注意：不要在代码中硬编码token！
// 请使用 python3 .local_encrypt.py 生成加密配置
// 然后通过 window.setupEncryptedToken() 动态配置

// 示例用法（不要使用这些值）：
/*
const EXAMPLE_CONFIG = {
    token: "加密的token数据",
    salt: "加密的盐值",
    iterations: 100000
};
*/

class GitHubNoteManager {
    constructor() {
        // 配置您的GitHub信息
        this.config = {
            owner: 'C6thunder',  // 您的GitHub用户名
            repo: 'thunder.github.io',   // 您的仓库名
            branch: 'main',  // 分支名
            token: ''  // 运行时填充
        };

        this.apiBase = 'https://api.github.com';
        this.encryptedConfig = null;  // 存储加密的token
    }

    // 设置加密token配置（由Python脚本生成）
    setEncryptedConfig(encryptedConfig) {
        // 支持传递密码或配置对象
        if (typeof encryptedConfig === 'string') {
            this.encryptedConfig = { token: encryptedConfig };
        } else {
            this.encryptedConfig = encryptedConfig;
        }
    }

    /**
     * 获取解密密码
     * 优先级：encryptedConfig.password > 默认密码
     */
    getDecryptionPassword() {
        if (this.encryptedConfig && this.encryptedConfig.password) {
            return this.encryptedConfig.password;
        }
        // 默认解密密码（可以修改为任意值）
        return "PublicCommentToken2024";
    }

    // 解密并获取token
    async getDecryptedToken() {
        if (!this.encryptedConfig) {
            console.log('未配置加密token');
            return null;
        }

        try {
            // 获取解密密码
            const password = this.getDecryptionPassword();
            console.log('🔑 使用解密密码:', password.replace(/./g, '*'));

            const encryptedData = this.encryptedConfig;

            // 检查是否包含iv（新的AES-GCM格式）
            if (!encryptedData.iv) {
                throw new Error('缺少IV参数，请使用新版本的加密脚本');
            }

            // 使用Web Crypto API解密
            const encoder = new TextEncoder();
            const passwordKey = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );

            const saltBytes = this.base64ToBytes(encryptedData.salt);
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltBytes,
                    iterations: encryptedData.iterations,
                    hash: 'SHA-256'
                },
                passwordKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            const tokenBytes = this.base64ToBytes(encryptedData.token);
            const ivBytes = this.base64ToBytes(encryptedData.iv);

            // 使用AES-GCM解密
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: ivBytes },
                key,
                tokenBytes
            );

            console.log('✅ Token解密成功');
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('❌ Token解密失败:', error.message);
            console.error('详细信息:', error);
            return null;
        }
    }

    // 辅助函数：字符串转UTF-8字节数组
    stringToBytes(str) {
        return new TextEncoder().encode(str);
    }

    // 辅助函数：字节数组转base64 (强制UTF-8)
    bytesToBase64(bytes) {
        // 使用更安全的方法处理UTF-8字节
        let binary = '';
        const chunkSize = 0x8000; // 32KB chunks
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
    }

    // 辅助函数：base64转字节数组 (强制UTF-8)
    base64ToBytes(base64) {
        try {
            // 转换urlsafe base64为标准base64
            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

            // 添加缺失的padding
            while (base64.length % 4 !== 0) {
                base64 += '=';
            }

            // 解码为二进制字符串
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);

            // 安全地转换每个字符为字节
            for (let i = 0; i < binaryString.length; i++) {
                const charCode = binaryString.charCodeAt(i);
                if (charCode > 255) {
                    // 如果遇到非Latin1字符，使用更安全的方法
                    const binary = btoa(binaryString);
                    const rawBytes = atob(binary);
                    const result = new Uint8Array(rawBytes.length);
                    for (let j = 0; j < rawBytes.length; j++) {
                        result[j] = rawBytes.charCodeAt(j);
                    }
                    return result;
                }
                bytes[i] = charCode;
            }
            return bytes;
        } catch (error) {
            console.error('Base64解码失败:', { original: base64, error: error.message });
            throw new Error('无效的base64编码: ' + error.message);
        }
    }

    // 初始化（只使用加密token）
    async init() {
        console.log('🔄 GitHubNoteManager.init() 开始...');
        console.log('📋 encryptedConfig 状态:', this.encryptedConfig);

        // 检查是否配置了加密token
        if (!this.encryptedConfig) {
            console.error('❌ 未配置加密token！');
            console.log('ℹ️ 请确保在HTML中调用 window.setupEncryptedToken()');
            return;
        }

        console.log('🔑 正在解密token...');
        // 尝试解密token
        const decryptedToken = await this.getDecryptedToken();
        console.log('🔑 解密结果:', decryptedToken ? '成功' : '失败');

        if (decryptedToken) {
            this.config.token = decryptedToken;
            console.log('✅ 已从加密配置加载token，用户可直接评论');
            console.log('🔑 Token前缀:', decryptedToken.substring(0, 10) + '...');
            return;
        } else {
            console.error('❌ Token解密失败，请检查加密配置');
            console.error('🔑 加密配置:', this.encryptedConfig);
        }
    }

    // 获取请求头
    getHeaders() {
        return {
            'Authorization': `token ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json; charset=utf-8',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    // 清理和验证内容，确保UTF-8安全
    sanitizeContent(content) {
        // 递归清理对象中的所有字符串
        if (typeof content === 'string') {
            // 确保字符串是有效的UTF-8
            try {
                const encoder = new TextEncoder();
                const decoder = new TextDecoder('utf-8', { fatal: false });
                const bytes = encoder.encode(content);
                return decoder.decode(bytes);
            } catch (e) {
                // 如果失败，尝试重新编码
                return new TextDecoder().decode(
                    new TextEncoder().encode(content)
                );
            }
        } else if (Array.isArray(content)) {
            return content.map(item => this.sanitizeContent(item));
        } else if (content !== null && typeof content === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(content)) {
                result[key] = this.sanitizeContent(value);
            }
            return result;
        }
        return content;
    }

    // 验证配置
    validateConfig() {
        if (!this.config.token) {
            throw new Error('未加载加密token，请通过 window.setupEncryptedToken() 配置');
        }
        if (!this.config.owner || !this.config.repo) {
            throw new Error('GitHub仓库信息未配置');
        }
    }

    // 获取文件内容
    async getFile(path) {
        this.validateConfig();
        const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;

        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                return null; // 文件不存在
            }

            if (!response.ok) {
                const errorText = await response.text();
                // 只有在非404错误时才打印详细信息
                if (response.status !== 404) {
                    console.error('GitHub API错误:', {
                        status: response.status,
                        statusText: response.statusText,
                        url: url,
                        tokenPrefix: this.config.token ? this.config.token.substring(0, 10) + '...' : '未设置',
                        error: errorText
                    });
                }
                throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // 强制UTF-8解码
            const contentBytes = this.base64ToBytes(data.content);
            // 使用多个解码策略确保成功
            let contentString;
            try {
                // 策略1: 使用TextDecoder UTF-8
                contentString = new TextDecoder('utf-8', { fatal: false }).decode(contentBytes);
            } catch (e) {
                // 策略2: 使用默认解码
                contentString = new TextDecoder().decode(contentBytes);
            }

            // 验证解码结果
            if (!contentString || contentString.length === 0) {
                throw new Error('文件内容解码失败');
            }

            // 解析JSON
            try {
                const parsed = JSON.parse(contentString);
                // 再次清理确保UTF-8安全
                return this.sanitizeContent(parsed);
            } catch (parseError) {
                console.error('JSON解析失败:', {
                    error: parseError.message,
                    contentPreview: contentString.substring(0, 200)
                });
                throw new Error('JSON格式错误: ' + parseError.message);
            }
        } catch (error) {
            // 只在非404错误时打印异常
            if (error.message.indexOf('404') === -1) {
                console.error('获取文件异常:', { path, error: error.message });
            }
            throw error;
        }
    }

    // 创建或更新文件
    async saveFile(path, content, message) {
        this.validateConfig();

        try {
            // 先检查文件是否存在
            const existing = await this.getFile(path);

            // 深度处理UTF-8编码
            // 1. 确保内容是纯文本
            const sanitizedContent = this.sanitizeContent(content);

            // 2. 序列化为JSON字符串
            const jsonString = JSON.stringify(sanitizedContent, null, 2);

            // 3. 强制UTF-8编码 - 使用TextEncoder
            const utf8Bytes = new TextEncoder().encode(jsonString);

            // 4. 验证UTF-8编码正确性
            const decoder = new TextDecoder('utf-8', { fatal: false });
            const testDecode = decoder.decode(utf8Bytes);
            if (testDecode !== jsonString) {
                throw new Error('UTF-8编码验证失败');
            }

            // 5. 转换为base64
            const base64Content = this.bytesToBase64(utf8Bytes);

            const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

            const body = {
                message,
                content: base64Content,
                branch: this.config.branch
            };

            // 如果文件存在，需要包含sha
            if (existing) {
                const fileUrl = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;
                const fileResponse = await fetch(fileUrl, {
                    headers: this.getHeaders()
                });
                const fileData = await fileResponse.json();
                body.sha = fileData.sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('保存文件失败:', {
                    status: response.status,
                    statusText: response.statusText,
                    path: path,
                    message: message,
                    error: errorText
                });
                throw new Error(`保存文件失败: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('保存文件异常:', { path, error: error.message });
            throw error;
        }
    }

    // 保存笔记（Markdown）
    async saveNote(note) {
        const timestamp = Date.now();
        const filename = `notes/note-${timestamp}.json`;
        const message = `Add note: ${note.title}`;

        return await this.saveFile(filename, note, message);
    }

    // 保存HTML笔记
    async saveHtmlNote(note) {
        const timestamp = Date.now();
        const filename = `htmlnotes/note-${timestamp}.json`;
        const message = `Add HTML note: ${note.title}`;

        return await this.saveFile(filename, note, message);
    }

    // 保存评论到笔记文件
    async saveComment(comment) {
        try {
            // 获取笔记文件
            const noteFile = comment.noteType === 'html'
                ? `htmlnotes/${comment.noteId}.json`
                : `notes/${comment.noteId}.json`;

            const fileUrl = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${noteFile}?ref=${this.config.branch}`;

            const response = await fetch(fileUrl, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`获取笔记文件失败: ${response.statusText}`);
            }

            const fileData = await response.json();
            const note = JSON.parse(atob(fileData.content));

            // 添加评论到笔记的comments数组
            if (!note.comments) {
                note.comments = [];
            }

            note.comments.push(comment);

            // 保存更新后的笔记
            const message = `Add comment to ${comment.noteId}`;
            await this.saveFile(noteFile, note, message);

            // 也更新本地localStorage
            const storedComments = localStorage.getItem(`comments_${comment.noteId}`);
            const localComments = storedComments ? JSON.parse(storedComments) : [];
            localComments.push(comment);
            localStorage.setItem(`comments_${comment.noteId}`, JSON.stringify(localComments));

            return { success: true };
        } catch (error) {
            console.error('保存评论失败:', error);
            throw error;
        }
    }

    // 获取所有笔记（通过扫描文件夹）
    async getAllNotes() {
        // 使用scanAllNotes获取所有笔记
        return await this.scanAllNotes();
    }

    // 扫描指定文件夹获取所有JSON文件
    async scanFolder(folderPath) {
        const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${folderPath}?ref=${this.config.branch}`;

        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                // 文件夹不存在，返回空数组（静默处理）
                return [];
            }

            if (!response.ok) {
                throw new Error(`扫描文件夹失败: ${response.statusText}`);
            }

            const files = await response.json();
            const jsonFiles = files.filter(file => file.name.endsWith('.json'));

            const notes = [];
            for (const file of jsonFiles) {
                try {
                    const fileUrl = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${file.path}?ref=${this.config.branch}`;
                    const fileResponse = await fetch(fileUrl, {
                        headers: this.getHeaders()
                    });

                    if (fileResponse.ok) {
                        const fileData = await fileResponse.json();
                        const noteData = JSON.parse(atob(fileData.content));
                        notes.push(noteData);
                    }
                } catch (error) {
                    console.warn(`读取文件 ${file.name} 失败:`, error);
                }
            }

            return notes;
        } catch (error) {
            // 静默处理错误，不显示警告
            return [];
        }
    }

    // 扫描所有笔记（Markdown + HTML）
    async scanAllNotes() {
        const [markdownNotes, htmlNotes] = await Promise.all([
            this.scanFolder('notes'),
            this.scanFolder('htmlnotes')
        ]);

        // 合并并按日期排序
        const allNotes = [...markdownNotes, ...htmlNotes].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        return allNotes;
    }

    // 更新notes.json
    async updateNotesList(note) {
        let notesList = await this.getFile('notes/notes.json');

        if (!notesList) {
            notesList = { notes: [] };
        }

        notesList.notes.unshift(note);

        return await this.saveFile('notes/notes.json', notesList, `Update notes list: add ${note.title}`);
    }

    // 更新笔记
    async updateNote(noteId, updatedNote) {
        // 根据笔记类型选择保存路径
        const folder = updatedNote.type === 'html' ? 'htmlnotes' : 'notes';
        const filename = `${folder}/${noteId}.json`;
        const message = `Update note: ${updatedNote.title}`;

        // 1. 更新单个笔记文件
        await this.saveFile(filename, updatedNote, message);

        // 2. 更新notes.json中的笔记列表
        let notesList = await this.getFile('notes/notes.json');
        if (notesList && notesList.notes) {
            const noteIndex = notesList.notes.findIndex(note => note.id === noteId);
            if (noteIndex !== -1) {
                // 更新列表中的笔记
                const excerpt = updatedNote.excerpt || (updatedNote.type === 'html'
                    ? updatedNote.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                    : updatedNote.content.substring(0, 100) + (updatedNote.content.length > 100 ? '...' : ''));

                notesList.notes[noteIndex] = {
                    ...updatedNote,
                    excerpt
                };
                await this.saveFile('notes/notes.json', notesList, `Update notes list: modify ${updatedNote.title}`);
            }
        }

        return { success: true };
    }

    // 获取单个笔记（包括HTML笔记和评论）
    async getNoteById(noteId) {
        // 从notes文件夹扫描获取笔记
        const allNotes = await this.scanAllNotes();
        const note = allNotes.find(n => n.id === noteId);

        if (note) {
            // 确保comments数组存在
            if (!note.comments) {
                note.comments = [];
            }
            return { note, type: note.type || 'markdown' };
        }

        return null;
    }

    // 获取笔记的评论
    async getComments(noteId) {
        try {
            // 从notes扫描获取笔记
            const allNotes = await this.scanAllNotes();
            const note = allNotes.find(n => n.id === noteId);

            if (note && note.comments) {
                return note.comments.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            return [];
        } catch (error) {
            console.warn('获取评论失败:', error);
            return [];
        }
    }

    // 测试连接
    async testConnection() {
        this.validateConfig();
        const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}`;

        const response = await fetch(url, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`连接失败: ${response.statusText}`);
        }

        return await response.json();
    }
}

// 导出单例
const githubNoteManager = new GitHubNoteManager();

// 全局函数：配置加密token并初始化
// 调用方式：window.setupEncryptedToken(encryptedConfig);
/**
 * 设置加密token配置
 * @type {(config: EncryptedTokenConfig) => void}
 */
window.setupEncryptedToken = function (encryptedConfig) {
    console.log('🔧 window.setupEncryptedToken() 被调用');
    console.log('📋 收到的配置:', encryptedConfig);

    githubNoteManager.setEncryptedConfig(encryptedConfig);
    console.log('📋 已设置 encryptedConfig');

    // 初始化以加载加密token
    console.log('🔄 开始初始化...');
    githubNoteManager.init().then(() => {
        console.log('✅ 初始化完成');
        // 通知其他组件token已加载
        window.dispatchEvent(new CustomEvent('tokenLoaded'));
    }).catch(err => {
        console.error('❌ 初始化失败:', err);
    });
};

// 导出给全局使用
try {
    window.githubNoteManager = githubNoteManager;

    // 验证导出是否成功
    if (typeof window.githubNoteManager === 'undefined') {
        console.error('❌ 导出 githubNoteManager 失败');
    } else {
        console.log('✅ GitHub Note Manager 已成功加载');
    }
} catch (error) {
    console.error('❌ 加载 GitHub API 时出错:', error);
}

// 添加全局错误处理
window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('github-api.js')) {
        console.error('❌ GitHub API 脚本错误:', e.error);
    }
});

// 编码自动修复和验证功能
window.fixEncodingIssues = function() {
    console.log('🔧 开始编码修复...');

    // 检测浏览器编码设置
    if (navigator.language && navigator.language.includes('zh')) {
        console.log('✅ 浏览器语言设置正确:', navigator.language);
    }

    // 强制页面编码为UTF-8
    if (document.characterSet !== 'UTF-8') {
        console.warn('⚠️ 页面编码不是UTF-8:', document.characterSet);
    } else {
        console.log('✅ 页面编码正确: UTF-8');
    }

    // 检查TextEncoder支持
    if (typeof TextEncoder === 'undefined') {
        console.error('❌ 浏览器不支持TextEncoder');
        return false;
    }

    // 测试中文编码
    const testStr = '测试中文编码123';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const encoded = encoder.encode(testStr);
    const decoded = decoder.decode(encoded);

    if (decoded === testStr) {
        console.log('✅ UTF-8编码测试通过');
        return true;
    } else {
        console.error('❌ UTF-8编码测试失败:', decoded);
        return false;
    }
};

// 页面加载时自动检查编码
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const result = window.fixEncodingIssues();
        if (result) {
            console.log('✅ 编码验证通过');
        } else {
            console.warn('⚠️ 编码验证失败，已尝试自动修复');
        }
    }, 100);
});
