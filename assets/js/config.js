// 全局配置文件 - 修改这里的设置会影响整个网站
window.APP_CONFIG = {
    // 头像配置
    avatar: {
        // 可以是相对路径、绝对路径或在线图片URL
        src: 'assets/img/avatar.jpg',
        size: {
            small: '36px',    // 导航栏小头像
            medium: '48px',   // 中等头像
            large: '120px'    // 个人页大头像
        },
        alt: '用户头像',
        fallback: 'T'  // 图片加载失败时显示的文字
    },

    // 网站基本信息
    site: {
        title: 'thunder的个人笔记',
        subtitle: '记录生活点滴',
        author: 'thunder',
        email: '15346046526@163.com',
        github: 'https://github.com/thunder'
    },

    // 主题配置
    theme: {
        default: 'warm',  // 默认主题：暖黄主题
        options: ['diary', 'dark', 'warm', 'minimal']
    },

    // GitHub配置
    github: {
        // Token配置在HTML中单独设置
    }
};

// 提供一个函数来更新头像
window.updateAvatar = function (newSrc) {
    if (newSrc) {
        window.APP_CONFIG.avatar.src = newSrc;
        // 更新所有页面的头像
        document.querySelectorAll('img[src*="avatar.jpg"]').forEach(img => {
            img.src = newSrc;
        });
        console.log('头像已更新为:', newSrc);
    }
};

// 提供一个函数来获取当前头像
window.getAvatar = function () {
    return window.APP_CONFIG.avatar.src;
};

// 如果在localStorage中保存了自定义头像，使用自定义的
if (localStorage.getItem('customAvatar')) {
    window.APP_CONFIG.avatar.src = localStorage.getItem('customAvatar');
}

// 自动应用配置到页面
window.applyConfig = function () {
    // 应用头像配置
    document.querySelectorAll('img[data-config="avatar"]').forEach(img => {
        img.src = window.APP_CONFIG.avatar.src;
        img.alt = window.APP_CONFIG.avatar.alt;
    });

    // 应用网站信息
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = window.APP_CONFIG.site.author;
    }
    if (document.getElementById('userEmail')) {
        document.getElementById('userEmail').textContent = window.APP_CONFIG.site.email;
    }
};

// 页面加载完成后自动应用
document.addEventListener('DOMContentLoaded', window.applyConfig);
