// GitHub API 集成 - 笔记和评论管理
class GitHubNoteManager {
    constructor() {
        // 配置您的GitHub信息（从localStorage加载，不在此处硬编码）
        this.config = {
            owner: '',  // GitHub用户名
            repo: '',   // 仓库名
            branch: 'main',  // 分支名
            token: ''  // GitHub Personal Access Token（需要通过setup.html配置）
        };

        this.apiBase = 'https://api.github.com';
    }

    // 设置配置
    setConfig(owner, repo, branch, token) {
        this.config.owner = owner;
        this.config.repo = repo;
        this.config.branch = branch;
        this.config.token = token;
        this.saveConfig();
    }

    // 保存配置到localStorage
    saveConfig() {
        const { owner, repo, branch, token } = this.config;
        localStorage.setItem('githubConfig', JSON.stringify({ owner, repo, branch, token: token ? '***' : '' }));
    }

    // 加载配置
    loadConfig() {
        const saved = localStorage.getItem('githubConfig');
        if (saved) {
            const config = JSON.parse(saved);
            this.config = { ...this.config, ...config };
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
        // 这里需要从comments目录读取所有评论并过滤
        // 由于GitHub API限制，我们返回一个示例
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
githubNoteManager.loadConfig();
