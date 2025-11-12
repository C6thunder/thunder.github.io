// 点击特效功能
(function() {
    // 监听整个页面的点击事件
    document.addEventListener('click', function(e) {
        // 创建波纹特效
        createRippleEffect(e);

        // 为暖黄主题添加额外的星星特效
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'warm') {
            createStarEffect(e);
        }
    });

    // 创建波纹特效
    function createRippleEffect(e) {
        const ripple = document.createElement('div');
        ripple.className = 'click-effect';

        // 获取点击位置
        const x = e.clientX;
        const y = e.clientY;

        // 设置位置
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        // 添加到页面
        document.body.appendChild(ripple);

        // 动画结束后移除元素
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }

    // 创建星星特效（仅暖黄主题）
    function createStarEffect(e) {
        const starsCount = 5; // 创建5个星星
        const x = e.clientX;
        const y = e.clientY;

        for (let i = 0; i < starsCount; i++) {
            const star = document.createElement('div');
            star.className = 'click-star';
            star.innerHTML = '✦'; // 使用星星符号

            // 随机颜色（金色系）
            const colors = [
                'rgba(243, 156, 18, 0.8)',
                'rgba(241, 196, 15, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(255, 152, 0, 0.8)'
            ];
            star.style.color = colors[Math.floor(Math.random() * colors.length)];

            // 设置初始位置
            star.style.left = x + 'px';
            star.style.top = y + 'px';
            star.style.fontSize = (Math.random() * 15 + 10) + 'px';

            // 随机偏移距离和角度
            const angle = (Math.PI * 2 * i) / starsCount;
            const distance = Math.random() * 50 + 30;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            // 应用动画
            star.animate([
                {
                    transform: 'translate(0, 0) scale(0) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translate(${offsetX}px, ${offsetY}px) scale(1) rotate(180deg)`,
                    opacity: 1
                },
                {
                    transform: `translate(${offsetX}px, ${offsetY}px) scale(0) rotate(360deg)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'ease-out'
            });

            // 添加到页面
            document.body.appendChild(star);

            // 动画结束后移除
            setTimeout(() => {
                star.remove();
            }, 800);
        }
    }

    console.log('✨ 点击特效已启用');
})();
