// 飘落效果系统 - 可应用于所有页面
window.FallEffectSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    fallTheme: 'sakura',
    pageTheme: 'warm',
    isRunning: false,
    debugElement: null,

    showDebug(message) {
        if (this.debugElement) {
            this.debugElement.textContent = message;
            this.debugElement.classList.add('show');
            setTimeout(() => {
                this.debugElement.classList.remove('show');
            }, 3000);
        }
        if (console && console.log) {
            console.log('FALL DEBUG:', message);
        }
    },

    // 简化配色方案
    colors: {
        sakura: ['#FFB7C5', '#FFC0CB', '#FF69B4', '#FF1493'],
        snow: ['#FFFFFF', '#E0E0E0', '#F0F0F0'],
        leaf: ['#FF6B6B', '#FFA07A', '#FF8C00'],
        heart: ['#FF1744', '#FF4569', '#E91E63'],
        star: ['#FFD700', '#FFA500', '#FFCC33']
    },

    count: {
        sakura: 30,
        snow: 50,
        leaf: 25,
        heart: 30,
        star: 40
    },

    init() {
        console.log('FallEffectSystem 初始化...');

        // 查找或创建调试提示元素
        this.debugElement = document.getElementById('fall-debug');
        if (!this.debugElement) {
            this.debugElement = document.createElement('div');
            this.debugElement.id = 'fall-debug';
            this.debugElement.style.cssText = `
                position: fixed;
                bottom: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                pointer-events: none;
                display: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            `;
            document.body.appendChild(this.debugElement);

            const style = document.createElement('style');
            style.textContent = `
                #fall-debug.show {
                    display: block;
                    animation: fall-debug-fadein 0.3s ease;
                }
                @keyframes fall-debug-fadein {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        // 查找或创建 Canvas
        this.canvas = document.getElementById('fallCanvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fallCanvas';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                display: block;
            `;
            document.body.appendChild(this.canvas);
        }

        // 设置 Canvas 尺寸
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Failed to get canvas context!');
            this.showDebug('✗ Canvas 初始化失败');
            return;
        }

        // 测试绘制
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(0, 0, this.canvas.width, 20);

        this.showDebug('✓ Canvas 初始化成功！宽: ' + this.canvas.width + ', 高: ' + this.canvas.height);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 获取当前页面主题
        const savedPageTheme = localStorage.getItem('selectedTheme') || 'warm';
        this.pageTheme = savedPageTheme;

        // 恢复上次的飘落主题
        const savedFallTheme = localStorage.getItem('fallEffectTheme') || 'sakura';
        this.fallTheme = savedFallTheme;

        // 绑定按钮事件（仅在有按钮的页面）
        const buttons = document.querySelectorAll('.fall-btn');
        if (buttons.length > 0) {
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const theme = btn.dataset.theme;
                    this.switchTheme(theme);

                    // 更新按钮状态
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }

        // 监听主题切换事件
        document.addEventListener('themeChanged', (e) => {
            this.pageTheme = e.detail.theme;
            if (this.fallTheme !== 'off') {
                this.switchTheme(this.fallTheme);
            }
        });

        // 启动默认主题
        if (this.fallTheme !== 'off') {
            this.switchTheme(this.fallTheme);
        }

        console.log('FallEffectSystem initialization complete!');
    },

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    },

    switchTheme(theme) {
        console.log('切换飘落主题:', theme);

        if (theme === 'off') {
            this.stop();
            localStorage.setItem('fallEffectTheme', 'off');
            return;
        }

        this.fallTheme = theme;
        this.particles = [];

        // 获取配色和粒子数
        const colors = this.colors[theme];
        const count = this.count[theme];

        if (!colors || !count) {
            console.error('无效主题:', theme);
            return;
        }

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.showDebug('✓ Canvas工作正常 - 主题: ' + theme + ', 粒子: ' + count);

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(theme, colors, this.canvas.width, this.canvas.height));
        }

        if (!this.isRunning) {
            this.start();
        }

        localStorage.setItem('fallEffectTheme', theme);
    },

    start() {
        if (this.isRunning) return;

        this.isRunning = true;

        // 立即绘制一帧
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });

        this.showDebug('✓ 动画启动！粒子: ' + this.particles.length + ' (F12查看更多)');
        this.animate();
    },

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.showDebug('动画已停止');
    },

    animate() {
        if (!this.isRunning || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
};

class Particle {
    constructor(fallTheme, colors, canvasWidth, canvasHeight) {
        this.fallTheme = fallTheme;
        this.colors = colors;
        this.reset(canvasWidth, canvasHeight, true);
    }

    reset(canvasWidth, canvasHeight, randomY = false) {
        this.x = Math.random() * canvasWidth;
        this.y = randomY ? Math.random() * canvasHeight : Math.random() * canvasHeight * 0.8 - 50;
        this.size = Math.random() * 12 + 6;
        this.speed = Math.random() * 2 + 0.5;
        this.wind = Math.random() * 1 - 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.opacity = 0.7 + Math.random() * 0.3;
        this.pulseSpeed = Math.random() * 0.1 + 0.05;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    update() {
        this.y += this.speed;
        this.x += this.wind;
        this.rotation += this.rotationSpeed;
        this.pulsePhase += this.pulseSpeed;

        if (this.y > window.innerHeight + 50 || this.x < -50 || this.x > window.innerWidth + 50) {
            this.reset(window.innerWidth, window.innerHeight);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        if (this.fallTheme === 'sakura') {
            this.drawSakura(ctx);
        } else if (this.fallTheme === 'snow') {
            this.drawSnowflake(ctx);
        } else if (this.fallTheme === 'leaf') {
            this.drawLeaf(ctx);
        } else if (this.fallTheme === 'heart') {
            this.drawHeart(ctx);
        } else if (this.fallTheme === 'star') {
            this.drawStar(ctx);
        } else {
            // 默认绘制彩色圆圈
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

Particle.prototype.drawSakura = function(ctx) {
    const pulseSize = this.size * (1 + Math.sin(this.pulsePhase) * 0.1);

    // 绘制樱花花瓣（5瓣）
    ctx.fillStyle = this.color;
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = Math.cos(angle) * pulseSize * 0.6;
        const y = Math.sin(angle) * pulseSize * 0.6;
        ctx.beginPath();
        ctx.ellipse(x, y, pulseSize * 0.35, pulseSize * 0.25, angle, 0, Math.PI * 2);
        ctx.fill();
    }

    // 花心
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, pulseSize * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 中心点
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, pulseSize * 0.08, 0, Math.PI * 2);
    ctx.fill();
};

Particle.prototype.drawSnowflake = function(ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    // 绘制6角雪花
    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.size);
        ctx.stroke();

        // 分枝
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.6);
        ctx.lineTo(this.size * 0.2, -this.size * 0.7);
        ctx.moveTo(0, -this.size * 0.6);
        ctx.lineTo(-this.size * 0.2, -this.size * 0.7);
        ctx.stroke();
    }
};

Particle.prototype.drawLeaf = function(ctx) {
    ctx.fillStyle = this.color;

    // 绘制枫叶形状
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.bezierCurveTo(
        this.size * 0.3, -this.size * 0.8,
        this.size * 0.8, -this.size * 0.3,
        this.size * 0.6, this.size * 0.2
    );
    ctx.bezierCurveTo(
        this.size * 0.5, this.size * 0.5,
        this.size * 0.2, this.size * 0.8,
        0, this.size
    );
    ctx.bezierCurveTo(
        -this.size * 0.2, this.size * 0.8,
        -this.size * 0.5, this.size * 0.5,
        -this.size * 0.6, this.size * 0.2
    );
    ctx.bezierCurveTo(
        -this.size * 0.8, -this.size * 0.3,
        -this.size * 0.3, -this.size * 0.8,
        0, -this.size
    );
    ctx.closePath();
    ctx.fill();

    // 叶脉
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(0, this.size);
    ctx.stroke();

    // 叶柄
    ctx.beginPath();
    ctx.moveTo(0, this.size);
    ctx.lineTo(0, this.size + this.size * 0.3);
    ctx.stroke();

    // 重置strokeStyle避免影响其他绘制
    ctx.strokeStyle = this.color;
};

Particle.prototype.drawHeart = function(ctx) {
    const topCurveHeight = this.size * 0.3;
    ctx.fillStyle = this.color;

    // 绘制爱心
    ctx.beginPath();
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(
        0, topCurveHeight - this.size * 0.3,
        -this.size, topCurveHeight - this.size * 0.1,
        -this.size, topCurveHeight
    );
    ctx.bezierCurveTo(
        -this.size, topCurveHeight + this.size * 0.5,
        -this.size * 0.2, topCurveHeight + this.size * 0.8,
        0, topCurveHeight + this.size
    );
    ctx.bezierCurveTo(
        this.size * 0.2, topCurveHeight + this.size * 0.8,
        this.size, topCurveHeight + this.size * 0.5,
        this.size, topCurveHeight
    );
    ctx.bezierCurveTo(
        this.size, topCurveHeight - this.size * 0.1,
        0, topCurveHeight - this.size * 0.3,
        0, topCurveHeight
    );
    ctx.closePath();
    ctx.fill();

    // 高光效果
    ctx.globalAlpha = this.opacity * 0.3;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.3, topCurveHeight - this.size * 0.2, this.size * 0.15, this.size * 0.1, -0.5, 0, Math.PI * 2);
    ctx.fill();
};

Particle.prototype.drawStar = function(ctx) {
    const twinkle = Math.sin(this.pulsePhase) * 0.2 + 0.8;
    ctx.fillStyle = this.color;

    // 添加发光效果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15 * twinkle;

    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / 5;
    ctx.moveTo(0, -this.size);
    for (let i = 0; i < 5; i++) {
        const x = Math.cos(rot) * this.size;
        const y = Math.sin(rot) * this.size;
        ctx.lineTo(x, y);
        rot += step;
        const x2 = Math.cos(rot) * this.size * 0.5;
        const y2 = Math.sin(rot) * this.size * 0.5;
        ctx.lineTo(x2, y2);
        rot += step;
    }
    ctx.lineTo(0, -this.size);
    ctx.closePath();
    ctx.fill();

    // 内部光晕
    ctx.shadowBlur = 0;
    ctx.globalAlpha = this.opacity * 0.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, -this.size * 0.6);
    for (let i = 0; i < 5; i++) {
        rot = Math.PI / 2 * 3 + (Math.PI / 5) * i * 2;
        const x = Math.cos(rot) * this.size * 0.3;
        const y = Math.sin(rot) * this.size * 0.3;
        ctx.lineTo(x, y);
        rot += Math.PI / 5;
    }
    ctx.closePath();
    ctx.fill();
};

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (window.FallEffectSystem && window.FallEffectSystem.init) {
                window.FallEffectSystem.init();
            }
        }, 100);
    });
} else {
    // 如果 DOM 已经加载完成
    setTimeout(() => {
        if (window.FallEffectSystem && window.FallEffectSystem.init) {
            window.FallEffectSystem.init();
        }
    }, 100);
}
