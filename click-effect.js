// 点击特效功能 - 增强版
(function() {
    // 确保DOM加载完成
    function initClickEffect() {
        // 监听整个页面的点击事件
        document.addEventListener('click', function(e) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            createClickEffect(e, currentTheme);
        });
        console.log('✨ 点击特效已启用');
    }

    // 如果DOM已经加载完成，立即初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initClickEffect);
    } else {
        initClickEffect();
    }

    // 创建点击特效
    function createClickEffect(e, theme) {
        const x = e.clientX;
        const y = e.clientY;

        // 根据主题创建不同数量的特效
        const effectsCount = {
            'diary': 6,     // 树叶
            'dark': 8,      // 星星
            'warm': 10,     // 暖色碎屑
            'minimal': 6    // 雪花
        };

        const count = effectsCount[theme] || 5;

        for (let i = 0; i < count; i++) {
            const effect = document.createElement('div');
            effect.className = 'click-effect';

            // 设置初始位置
            effect.style.left = x + 'px';
            effect.style.top = y + 'px';

            // 随机偏移
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const distance = Math.random() * 50 + 20;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            // 使用CSS变量设置随机偏移
            effect.style.setProperty('--random-x', offsetX + 'px');

            // 添加到页面
            document.body.appendChild(effect);

            // 动画结束后移除元素
            setTimeout(() => {
                effect.remove();
            }, 1500);
        }
    }
})();
