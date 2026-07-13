#!/usr/bin/env python3
# 统一品牌色：青绿+橙 -> 深绿(#2d5016)+金(#c9a84c) 家族
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))

# hex 精确映射（区分大小写，仅替淘汰色）
HEX_MAP = {
    # 青绿 -> 深绿
    '#3D8B7A': '#2d5016',
    '#5DAF9A': '#3a6b1e',
    '#2D6B5E': '#1e3a0e',
    '#4A9F8A': '#2d5016',
    '#7ACFBA': '#4a7a2e',
    '#6BBFAA': '#3a6b1e',
    # 橙 -> 金
    '#E8A87C': '#c9a84c',
    '#F0C4A0': '#d4b85a',
    # 冷灰占位/分隔 -> 米灰
    '#E8F0EC': '#f5f0e8',
    '#D0E8DD': '#e8e0d4',
    '#D0D8D0': '#e8e0d4',
    '#EEF4F0': '#f5f0e8',
    '#EEF1EC': '#f5f0e8',
    '#E5E8E5': '#e8e0d4',
    '#e0e8e4': '#e8e0d4',
    '#9AA6A0': '#999999',
    '#7A8A7A': '#999999',
    '#B0BAB4': '#999999',
}

# rgba() 十进制三元组映射（允许空格/逗号空白）
RGBA_MAP = {
    (232, 168, 124): (201, 168, 76),   # 橙 -> 金
    (61, 139, 122): (45, 80, 22),      # 青绿 -> 深绿
    (90, 175, 154): (58, 107, 30),     # #5DAF9A
    (74, 159, 138): (45, 80, 22),      # #4A9F8A
    (45, 107, 94): (30, 58, 14),       # #2D6B5E
}

FILES = [
    'app.wxss',
    'components/section-header/section-header.wxss',
    'components/banner-swiper/banner-swiper.wxss',
    'pages/index/index.wxss',
    'preview.html',
]

def unify(text):
    # hex
    for k, v in HEX_MAP.items():
        text = text.replace(k, v)
    # rgba()
    def repl(m):
        r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
        key = (r, g, b)
        if key in RGBA_MAP:
            nr, ng, nb = RGBA_MAP[key]
            return 'rgba(%d, %d, %d, %s' % (nr, ng, nb, m.group(4))
        return m.group(0)
    text = re.sub(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,([^)]*)\)', repl, text)
    return text

for rel in FILES:
    p = os.path.join(HERE, rel)
    with open(p, encoding='utf-8') as f:
        old = f.read()
    new = unify(old)
    if new != old:
        with open(p, 'w', encoding='utf-8') as f:
            f.write(new)
        print('updated:', rel)
    else:
        print('no-change:', rel)
