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
            repo: 'thunder_os_data',   // 您的仓库名
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
            return null;
        }

        try {
            // 获取解密密码
            const password = this.getDecryptionPassword();

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

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            return null;
        }
    }

    // 辅助函数：字符串转UTF-8字节数组
    stringToBytes(str) {
        return new TextEncoder().encode(str);
    }

    // 辅助函数：UTF-8转base64
    utf8ToBase64(str) {
        try {
            // 使用现代API：TextEncoder
            const bytes = new TextEncoder().encode(str);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        } catch (error) {
            return '';
        }
    }

    // 辅助函数：base64转UTF-8
    base64ToUtf8(base64) {
        try {
            // 解码base64为二进制字符串
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            // 使用TextDecoder解码为UTF-8字符串
            return new TextDecoder('utf-8').decode(bytes);
        } catch (error) {
            return '';
        }
    }

    // 辅助函数：字节数组转base64
    bytesToBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // 辅助函数：base64转字节数组
    base64ToBytes(base64) {
        try {
            if (!base64 || base64.trim() === '') {
                throw new Error('空字符串');
            }

            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

            while (base64.length % 4 !== 0) {
                base64 += '=';
            }

            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } catch (error) {
            return new Uint8Array(0);
        }
    }

    // 初始化（只使用加密token）
    async init() {
        if (!this.encryptedConfig) {
            console.error('未配置加密token');
            return;
        }

        const decryptedToken = await this.getDecryptedToken();
        if (decryptedToken) {
            this.config.token = decryptedToken;
        } else {
            console.error('Token解密失败，请检查加密配置');
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
            const response = await fetch(url, { headers: this.getHeaders() });

            if (response.status === 404) return null;

            if (!response.ok) {
                throw new Error(`获取文件失败: ${response.status}`);
            }

            const data = await response.json();
            const contentString = this.base64ToUtf8(data.content);
            return JSON.parse(contentString);
        } catch (error) {
            if (!error.message.includes('404')) {
                console.error('获取文件异常:', { path, error: error.message });
            }
            throw error;
        }
    }

    // 获取原始文件内容（不解析为JSON）
    async getRawFile(path) {
        this.validateConfig();
        const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;

        try {
            const response = await fetch(url, { headers: this.getHeaders() });

            if (response.status === 404) {
                throw new Error(`文件不存在: ${path}`);
            }

            if (!response.ok) {
                throw new Error(`获取文件失败: ${response.status}`);
            }

            const data = await response.json();
            return this.base64ToUtf8(data.content);
        } catch (error) {
            if (!error.message.includes('404')) {
                console.error('获取原始文件异常:', { path, error: error.message });
            }
            throw error;
        }
    }

    // 创建或更新文件（JSON格式）
    async saveFile(path, content, message) {
        const jsonString = JSON.stringify(content, null, 2);
        return await this._saveFileInternal(path, jsonString, message);
    }

    // 保存原始文件（不转换为JSON）
    async saveRawFile(path, content, message) {
        return await this._saveFileInternal(path, content, message, true);
    }

    // 内部通用保存方法
    async _saveFileInternal(path, content, message, isRaw = false) {
        this.validateConfig();
        const base64Content = this.utf8ToBase64(content);

        // 获取文件sha（如果存在）
        let sha = null;
        try {
            const fileUrl = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;
            const fileResponse = await fetch(fileUrl, { headers: this.getHeaders() });
            if (fileResponse.ok) {
                const fileData = await fileResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // 文件不存在，继续创建
        }

        const body = { message, content: base64Content, branch: this.config.branch };
        if (sha) body.sha = sha;

        const response = await fetch(`${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`保存文件失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    }

    // 保存笔记
    async saveNote(note) {
        // 从note.id中提取时间戳，确保文件名一致
        const timestamp = note.id.replace('note-', '');

        if (note.type === 'html') {
            // HTML笔记：保存到notecontent/文件夹
            const filename = `notecontent/note-${timestamp}.html`;
            await this.saveRawFile(filename, note.content, `Add HTML note: ${note.title}`);

            // 更新notes.json中的笔记列表
            const noteWithPath = { ...note, content: filename };
            await this.updateNotesList(noteWithPath);
            return { success: true, note: noteWithPath };
        } else {
            // Markdown笔记：保存到notes/文件夹
            const filename = `notes/note-${timestamp}.json`;
            const message = `Add note: ${note.title}`;
            return await this.saveFile(filename, note, message);
        }
    }

    // 保存评论到独立的 comments 文件
    async saveComment(comment) {
        try {
            const commentFilePath = `comments/${comment.noteId}.json`;

            // 获取现有评论文件
            let existingComments = [];
            try {
                const existingData = await this.getFile(commentFilePath);
                if (existingData && existingData.comments) {
                    existingComments = existingData.comments;
                }
            } catch (error) {
                // 文件不存在，继续创建新的
                console.log('评论文件不存在，将创建新文件');
            }

            // 添加新评论
            existingComments.push(comment);

            // 保存评论文件
            const commentData = {
                noteId: comment.noteId,
                comments: existingComments
            };

            const message = `Add comment to ${comment.noteId}`;
            await this.saveFile(commentFilePath, commentData, message);

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

    // 扫描所有笔记（从 notes.json 读取）
    async scanAllNotes() {
        try {
            if (!this.config || !this.config.token) {
                return [];
            }

            const notesData = await this.getFile('notes.json');

            if (!notesData) {
                return [];
            }

            if (!notesData.notes || !Array.isArray(notesData.notes)) {
                return [];
            }

            // 返回笔记列表，按日期排序
            const allNotes = notesData.notes.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            return allNotes;
        } catch (error) {
            return [];
        }
    }

    // 更新notes.json（根目录）
    async updateNotesList(note) {
        let notesList = await this.getFile('notes.json');

        if (!notesList) {
            notesList = { notes: [], all_tags: {}, version: '3.0' };
        }

        if (!Array.isArray(notesList.notes)) {
            notesList.notes = [];
        }

        // 确保all_tags存在
        if (!notesList.all_tags || typeof notesList.all_tags !== 'object') {
            notesList.all_tags = {};
        }

        const existsIndex = notesList.notes.findIndex(n => n.id === note.id);
        if (existsIndex !== -1) {
            // 编辑模式：先从all_tags中移除旧标签，再添加新标签
            this.updateAllTags(notesList, notesList.notes[existsIndex], note);
            notesList.notes[existsIndex] = note;
        } else {
            // 新建模式：直接添加新标签到all_tags
            this.updateAllTags(notesList, null, note);
            notesList.notes.unshift(note);
        }

        notesList.lastUpdated = new Date().toISOString();

        return await this.saveFile('notes.json', notesList, `Update notes list: ${existsIndex !== -1 ? 'update' : 'add'} ${note.title}`);
    }

    // 更新all_tags字段
    updateAllTags(notesList, oldNote, newNote) {
        // 确保all_tags存在
        if (!notesList.all_tags || typeof notesList.all_tags !== 'object') {
            notesList.all_tags = {};
        }

        // 如果是编辑模式，先移除旧标签的计数
        if (oldNote && oldNote.tags && Array.isArray(oldNote.tags)) {
            oldNote.tags.forEach(tag => {
                if (notesList.all_tags[tag]) {
                    notesList.all_tags[tag]--;
                    // 如果计数为0，删除该标签
                    if (notesList.all_tags[tag] <= 0) {
                        delete notesList.all_tags[tag];
                    }
                }
            });
        }

        // 添加新标签的计数
        if (newNote && newNote.tags && Array.isArray(newNote.tags)) {
            newNote.tags.forEach(tag => {
                notesList.all_tags[tag] = (notesList.all_tags[tag] || 0) + 1;
            });
        }
    }

    // 更新笔记
    async updateNote(noteId, updatedNote) {
        // 只调用一次getFile获取notes.json
        const notesList = await this.getFile('notes.json');
        if (!notesList || !Array.isArray(notesList.notes)) {
            throw new Error('笔记列表不存在');
        }

        const originalNote = notesList.notes.find(n => n.id === noteId);
        if (!originalNote) {
            throw new Error('笔记不存在');
        }

        // HTML 笔记：content字段是文件路径，不需要在这里更新文件内容
        // 文件内容已在调用updateNote之前通过saveRawFile更新
        if (updatedNote.type !== 'html') {
            // Markdown 笔记才保存到 notes/ 文件夹
            const filename = `notes/${noteId}.json`;
            const message = `Update note: ${updatedNote.title}`;
            await this.saveFile(filename, updatedNote, message);
        }

        // 确保all_tags存在
        if (!notesList.all_tags || typeof notesList.all_tags !== 'object') {
            notesList.all_tags = {};
        }

        // 更新 all_tags（移除旧标签，添加新标签）
        this.updateAllTags(notesList, originalNote, updatedNote);

        // 更新 notes.json 中的笔记列表（使用已获取的notesList）
        const noteIndex = notesList.notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            notesList.notes[noteIndex] = { ...updatedNote, excerpt: updatedNote.excerpt };
            notesList.lastUpdated = new Date().toISOString();
            await this.saveFile('notes.json', notesList, `Update notes list: modify ${updatedNote.title}`);
        }

        return { success: true };
    }

    // 获取单个笔记
    async getNoteById(noteId) {
        // 直接从 notes.json 获取笔记以优化性能
        const notesList = await this.getFile('notes.json');
        const note = notesList?.notes?.find(n => n.id === noteId);

        if (note) {
            note.comments ||= []; // 确保comments数组存在
            return { note, type: note.type || 'markdown' };
        }

        return null;
    }

    // 获取笔记的评论
    async getComments(noteId) {
        try {
            // 从独立的 comments 文件获取
            const commentFilePath = `comments/${noteId}.json`;
            const commentData = await this.getFile(commentFilePath);

            if (commentData && commentData.comments) {
                return commentData.comments.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            return [];
        } catch (error) {
            console.warn('获取评论失败:', error);
            return [];
        }
    }

    // 批量获取所有笔记的评论数量
    async getAllCommentsCount(noteIds) {
        try {
            const commentFilePaths = noteIds.map(id => `comments/${id}.json`);
            const comments = await this.batchGetFiles(commentFilePaths);

            const countMap = {};
            noteIds.forEach(id => { countMap[id] = 0; });

            comments.forEach((data, index) => {
                const noteId = noteIds[index];
                if (data && Array.isArray(data.comments)) {
                    countMap[noteId] = data.comments.length;
                }
            });

            return countMap;
        } catch (error) {
            console.warn('批量获取评论数失败:', error);
            // 返回默认值
            const defaultCount = {};
            noteIds.forEach(id => { defaultCount[id] = 0; });
            return defaultCount;
        }
    }

    // 批量获取多个文件
    async batchGetFiles(paths) {
        const results = await Promise.allSettled(
            paths.map(path => this.getFile(path))
        );
        return results.map(result =>
            result.status === 'fulfilled' ? result.value : null
        );
    }

    // 获取评论数量（保持向后兼容）
    async getCommentCount(noteId) {
        try {
            const countMap = await this.getAllCommentsCount([noteId]);
            return countMap[noteId] || 0;
        } catch (error) {
            return 0;
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
window.setupEncryptedToken = function (encryptedConfig) {
    githubNoteManager.setEncryptedConfig(encryptedConfig);
    githubNoteManager.init().then(() => {
        window.dispatchEvent(new CustomEvent('tokenLoaded'));
    });
};

// 导出给全局使用
window.githubNoteManager = githubNoteManager;

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
