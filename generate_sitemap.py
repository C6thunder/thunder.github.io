#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动生成 Sitemap.xml 脚本
"""
import os
from datetime import datetime

# 您的网站域名（请修改为实际域名）
DOMAIN = "https://thunder.github.io"

# 静态页面列表
STATIC_PAGES = [
    {"url": "/", "priority": "1.0", "changefreq": "weekly"},
    {"url": "/notes.html", "priority": "0.9", "changefreq": "daily"},
    {"url": "/write.html", "priority": "0.8", "changefreq": "weekly"},
    {"url": "/profile.html", "priority": "0.7", "changefreq": "monthly"},
]

def generate_sitemap():
    """生成 sitemap.xml"""
    today = datetime.now().strftime("%Y-%m-%d")

    sitemap = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''

    # 添加静态页面
    for page in STATIC_PAGES:
        sitemap += f'''    <url>
        <loc>{DOMAIN}{page["url"]}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>{page["changefreq"]}</changefreq>
        <priority>{page["priority"]}</priority>
    </url>
'''

    # 如果有笔记文件，可以在这里动态添加
    # 例如遍历 notes 目录下的 .html 文件

    sitemap += '</urlset>'

    # 写入文件
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)

    print("✅ sitemap.xml 生成成功！")
    print(f"📅 更新日期：{today}")

if __name__ == "__main__":
    generate_sitemap()