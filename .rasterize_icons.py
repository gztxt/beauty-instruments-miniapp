#!/usr/bin/env python3
# 把 images/ 下的 SVG 图标栅格化为微信支持的 PNG（透明背景）
import cairosvg
import os

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "images")

# (svg 名, png 名, 目标边长px)
TARGETS = [
    ("tab-home.svg", "tab-home.png", 81),
    ("tab-home-active.svg", "tab-home-active.png", 81),
    ("tab-products.svg", "tab-products.png", 81),
    ("tab-products-active.svg", "tab-products-active.png", 81),
    ("tab-about.svg", "tab-about.png", 81),
    ("tab-about-active.svg", "tab-about-active.png", 81),
    ("tab-contact.svg", "tab-contact.png", 81),
    ("tab-contact-active.svg", "tab-contact-active.png", 81),
    ("icon-company.svg", "icon-company.png", 64),
    ("icon-address.svg", "icon-address.png", 64),
    ("icon-phone.svg", "icon-phone.png", 64),
    ("icon-email.svg", "icon-email.png", 64),
    ("icon-copy.svg", "icon-copy.png", 64),
]

for svg, png, sz in TARGETS:
    src = os.path.join(IMG, svg)
    dst = os.path.join(IMG, png)
    cairosvg.svg2png(url=src, write_to=dst, output_width=sz, output_height=sz)
    kb = os.path.getsize(dst) / 1024
    print(f"{png}: {sz}x{sz} {kb:.1f}KB")
