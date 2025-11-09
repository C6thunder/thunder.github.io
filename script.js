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
        document.getElementById('totalLogins').textContent = this.data.totalLogins;
        document.getElementById('successfulLogins').textContent = this.data.successfulLogins;
        document.getElementById('failedLogins').textContent = this.data.failedLogins;
        document.getElementById('totalVisits').textContent = this.data.totalVisits;

        this.updateLoginLogs();
        this.updateMethodStats();
    }

    updateLoginLogs() {
        const logList = document.getElementById('loginLogs');
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

        document.getElementById('emailLoginCount').textContent = emailCount;
        document.getElementById('googleLoginCount').textContent = googleCount;
        document.getElementById('githubLoginCount').textContent = githubCount;

        const emailPercent = total > 0 ? (emailCount / total * 100) : 0;
        const googlePercent = total > 0 ? (googleCount / total * 100) : 0;
        const githubPercent = total > 0 ? (githubCount / total * 100) : 0;

        document.getElementById('emailLoginBar').style.width = `${emailPercent}%`;
        document.getElementById('googleLoginBar').style.width = `${googlePercent}%`;
        document.getElementById('githubLoginBar').style.width = `${githubPercent}%`;
    }

    updateBrowserInfo() {
        const info = this.getBrowserInfo();
        document.getElementById('browserName').textContent = info.name;
        document.getElementById('osName').textContent = info.os;
        document.getElementById('screenResolution').textContent = info.screen;
        document.getElementById('timezone').textContent = info.timezone;
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
        // Form submission - 只做验证，不阻止提交
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            // 在表单提交前执行验证和填充
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Basic validation
            if (!email || !password) {
                e.preventDefault();
                this.dataCollector.trackLogin(email || '-', 'failed', 'email');
                this.showNotification('请填写所有字段', 'error');
                return;
            }

            if (!this.isValidEmail(email)) {
                e.preventDefault();
                this.dataCollector.trackLogin(email, 'failed', 'email');
                this.showNotification('请输入有效的邮箱地址', 'error');
                return;
            }

            // 验证通过，填充隐藏字段
            document.getElementById('timestamp').value = new Date().toISOString();
            document.getElementById('userAgent').value = navigator.userAgent;

            // 记录登录数据
            this.dataCollector.trackLogin(email, 'success', 'email');

            // 记住我功能
            const rememberMe = document.getElementById('rememberMe').checked;
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            }

            // 显示成功消息（不阻止表单提交）
            this.showNotification('登录成功！正在提交...', 'success');

            // 注意：不阻止表单提交，让 Netlify 处理
        });

        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

        // Social login buttons
        const googleBtn = document.querySelector('.google-btn');
        const githubBtn = document.querySelector('.github-btn');
        googleBtn.addEventListener('click', () => this.handleSocialLogin('Google'));
        githubBtn.addEventListener('click', () => this.handleSocialLogin('GitHub'));

        // Forgot password
        const forgotPassword = document.querySelector('.forgot-password');
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Register link
        const registerLink = document.querySelector('.register-link a');
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Data panel events
        const dataPanelToggle = document.getElementById('dataPanelToggle');
        const dataPanel = document.getElementById('dataPanel');
        const closePanelBtn = document.getElementById('closePanelBtn');
        const exportDataBtn = document.getElementById('exportData');
        const clearDataBtn = document.getElementById('clearData');

        dataPanelToggle.addEventListener('click', () => this.toggleDataPanel());
        closePanelBtn.addEventListener('click', () => this.closeDataPanel());
        exportDataBtn.addEventListener('click', () => this.dataCollector.exportData());
        clearDataBtn.addEventListener('click', () => this.dataCollector.clearData());

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (dataPanel.classList.contains('open') &&
                !dataPanel.contains(e.target) &&
                e.target !== dataPanelToggle) {
                this.closeDataPanel();
            }
        });
    }

    handleLogin(e) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!email || !password) {
            this.dataCollector.trackLogin(email || '-', 'failed', 'email');
            this.showNotification('请填写所有字段', 'error');
            e.preventDefault(); // 只有验证失败才阻止提交
            return;
        }

        if (!this.isValidEmail(email)) {
            this.dataCollector.trackLogin(email, 'failed', 'email');
            this.showNotification('请输入有效的邮箱地址', 'error');
            e.preventDefault(); // 只有验证失败才阻止提交
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

        // 允许表单提交到 Netlify
        // Netlify 会自动处理表单并发送邮件
        // 2秒后手动跳转（Netlify 的自动跳转有时不可靠）
        setTimeout(() => {
            window.location.href = `blog.html?email=${encodeURIComponent(email)}&submitted=1`;
        }, 2000);
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

    handleSocialLogin(provider) {
        const method = provider.toLowerCase();
        const email = `${method}@social.com`;

        this.dataCollector.trackLogin(email, 'success', method);

        // 显示成功消息
        this.showNotification(`${provider} 登录成功！`, 'success');

        // 跳转到博客首页
        const socialEmail = `social:${method}@login.com`;
        setTimeout(() => {
            window.location.href = `blog.html?email=${encodeURIComponent(socialEmail)}&method=${method}`;
        }, 1000);
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

    // 检查 URL 参数，如果表单已提交则跳转
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('form-submitted') || urlParams.has('submitted')) {
        const email = urlParams.get('email') || rememberedEmail || '';
        blogLogin.showNotification('✅ 登录成功！正在跳转...', 'success');
        setTimeout(() => {
            window.location.href = `blog.html${email ? '?email=' + encodeURIComponent(email) : ''}`;
        }, 1000);
    }

    // Add some demo credentials helper
    console.log('%c🔑 Demo Login Credentials', 'font-size: 16px; font-weight: bold; color: #667eea;');
    console.log('%c任何有效的邮箱和密码都可以登录（演示版本）', 'font-size: 12px; color: #999;');
    console.log('%c推荐测试邮箱: demo@example.com', 'font-size: 12px; color: #999;');
    console.log('%c推荐测试密码: password123', 'font-size: 12px; color: #999;');
    console.log('%c📊 点击右下角的图表按钮查看数据统计', 'font-size: 12px; color: #4ade80;');
});