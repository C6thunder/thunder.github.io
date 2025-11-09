// GitHub API 集成 - 笔记和评论管理

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
        this.encryptedConfig = encryptedConfig;
    }

    // 解密并获取token
    async getDecryptedToken() {
        if (!this.encryptedConfig) {
            console.log('未配置加密token');
            return null;
        }

        try {
            // 公共解密密码（这里可以动态生成或从服务器获取）
            // 注意：这是演示用，生产中应使用更安全的方式
            const password = "PublicCommentToken2024";  // 可公开的密码，前端可看到

            const encryptedData = this.encryptedConfig;

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
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM' },
                key,
                tokenBytes
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Token解密失败:', error);
            return null;
        }
    }

    // 辅助函数：base64转字节数组
    base64ToBytes(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // 初始化（只使用加密token）
    async init() {
        // 检查是否配置了加密token
        if (!this.encryptedConfig) {
            console.warn('⚠️ 未配置加密token，请通过 window.setupEncryptedToken() 配置');
            return;
        }

        // 尝试解密token
        const decryptedToken = await this.getDecryptedToken();
        if (decryptedToken) {
            this.config.token = decryptedToken;
            console.log('✅ 已从加密配置加载token，用户可直接评论');
            return;
        } else {
            console.error('❌ Token解密失败，请检查加密配置');
        }
    }

    /**
     * @deprecated 此方法已废弃，不再支持用户自定义token
     * 所有用户统一使用加密token
     */
    setConfig(owner, repo, branch, token) {
        console.warn('⚠️ setConfig() 已废弃，请使用加密token');
        this.config.owner = owner;
        this.config.repo = repo;
        this.config.branch = branch;
        // 注意：token参数不再使用，但保留以避免破坏现有代码
        console.log('ℹ️ Token参数已忽略，请使用加密token');
    }

    /**
     * @deprecated 此方法已废弃
     * 不再支持localStorage配置
     */
    saveConfig() {
        console.warn('⚠️ saveConfig() 已废弃，不再支持本地配置');
    }

    /**
     * @deprecated 此方法已废弃
     * 加载配置仅用于向后兼容，不再加载token
     */
    loadConfig() {
        const saved = localStorage.getItem('githubConfig');
        if (saved) {
            const config = JSON.parse(saved);
            // 只加载仓库信息，不加载token
            if (config.owner) this.config.owner = config.owner;
            if (config.repo) this.config.repo = config.repo;
            if (config.branch) this.config.branch = config.branch;
            console.log('ℹ️ 已加载本地仓库配置（不使用本地token）');
        }
    }

    // 获取请求头
    getHeaders() {
        return {
            'Authorization': `token ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    // 验证配置
    validateConfig() {
        if (!this.config.owner || !this.config.repo || !this.config.token) {
            throw new Error('请先配置GitHub信息');
        }
    }

    // 获取文件内容
    async getFile(path) {
        this.validateConfig();
        const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;

        const response = await fetch(url, {
            headers: this.getHeaders()
        });

        if (response.status === 404) {
            return null; // 文件不存在
        }

        if (!response.ok) {
            throw new Error(`获取文件失败: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.parse(atob(data.content));
    }

    // 创建或更新文件
    async saveFile(path, content, message) {
        this.validateConfig();

        // 先检查文件是否存在
        const existing = await this.getFile(path);
        const base64Content = btoa(JSON.stringify(content, null, 2));

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
            const error = await response.json();
            throw new Error(`保存文件失败: ${error.message}`);
        }

        return await response.json();
    }

    // 保存笔记
    async saveNote(note) {
        const timestamp = Date.now();
        const filename = `notes/note-${timestamp}.json`;
        const message = `Add note: ${note.title}`;

        return await this.saveFile(filename, note, message);
    }

    // 保存评论
    async saveComment(comment) {
        const timestamp = Date.now();
        const filename = `comments/comment-${timestamp}.json`;
        const message = `Add comment to ${comment.noteId}`;

        return await this.saveFile(filename, comment, message);
    }

    // 获取所有笔记
    async getAllNotes() {
        try {
            // 从notes.json获取笔记列表
            const notesList = await this.getFile('notes/notes.json');
            if (notesList && notesList.notes) {
                return notesList.notes;
            }
        } catch (error) {
            console.log('Notes file not found, starting fresh');
        }

        return [];
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

    // 批量获取评论
    async getComments(noteId) {
        // TODO: 从comments目录读取所有评论并按noteId过滤
        // 由于GitHub API限制和跨域问题，目前返回空数组
        // 未来可以考虑实现：遍历comments目录，过滤指定noteId的评论
        console.log('获取笔记评论:', noteId);
        return [];
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

// 自动初始化（尝试从加密配置加载token）
githubNoteManager.init().then(() => {
    console.log('GitHub Note Manager 初始化完成');
}).catch(err => {
    console.error('初始化失败:', err);
});

// 全局函数：在页面加载后自动配置加密token
// 调用方式：window.setupEncryptedToken(encryptedConfig);
/**
 * 设置加密token配置
 * @type {(config: EncryptedTokenConfig) => void}
 */
window.setupEncryptedToken = function (encryptedConfig) {
    githubNoteManager.setEncryptedConfig(encryptedConfig);
    // 重新初始化以加载加密token
    githubNoteManager.init().then(() => {
        console.log('✅ 已加载加密token，用户可直接评论');
        // 通知其他组件token已加载
        window.dispatchEvent(new CustomEvent('tokenLoaded'));
    });
};

// 导出给全局使用
window.githubNoteManager = githubNoteManager;
