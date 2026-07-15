/**
 * 产品数据共享模块
 * 供 pages/products/products.js 和 pages/product-detail/product-detail.js 共用
 *
 * 分类索引：
 *   0 — 美容仪器类
 *   1 — 皮肤检测类
 *   2 — 清洁护理类
 */

// ===== 美容仪器类 =====
const beautyDevices = [
  {
    id: 1, name: '多功能美容仪', model: 'BI-BM200',
    desc: '集清洁、导入、提拉、冷敷于一体的多功能美容仪器，满足日常护肤全流程需求。',
    imgText: '多功能美容仪',
    params: [
      { label: '产品型号', value: 'BI-BM200' },
      { label: '产品尺寸', value: '180×55×45mm' },
      { label: '产品重量', value: '180g' },
      { label: '电池容量', value: '1200mAh' },
      { label: '充电方式', value: 'Type-C快充' },
      { label: '防水等级', value: 'IPX7' }
    ],
    features: [
      { icon: '✨', title: '离子清洁', desc: '正离子深层吸附毛孔污垢' },
      { icon: '💎', title: '离子导入', desc: '负离子促进精华深层渗透' },
      { icon: '⚡', title: 'EMS提拉', desc: '微电流刺激肌肉紧致提升' },
      { icon: '❄️', title: '冷敷模式', desc: '舒缓镇定，收缩毛孔' }
    ],
    scenes: [
      { icon: '🏠', text: '家庭日常护理' },
      { icon: '💼', text: '出差旅行便携' },
      { icon: '💆', text: '美容院线使用' },
      { icon: '🎁', text: '节日礼品首选' }
    ],
    options: [
      { key: 'chassis', name: '机箱样式', required: true, values: [
        { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
        { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
        { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' }
      ]},
      { key: 'handle', name: '手柄样式', required: true, values: [
        { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
        { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' }
      ]},
      { key: 'bracket', name: '支架样式', required: false, values: [
        { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
        { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' }
      ]}
    ]
  },
  {
    id: 2, name: '射频美容仪', model: 'BI-RF300',
    desc: '采用多极射频技术，深层加热真皮层，刺激胶原蛋白再生，紧致肌肤轮廓，重现年轻光彩。',
    imgText: '射频美容仪',
    params: [
      { label: '产品型号', value: 'BI-RF300' },
      { label: '射频频率', value: '1MHz' },
      { label: '输出功率', value: '5W' },
      { label: '温控系统', value: 'NTC智能温控' },
      { label: '电极数量', value: '4极' },
      { label: '产品重量', value: '180g' }
    ],
    features: [
      { icon: '🔥', title: '多极射频', desc: '4极射频场均匀加热真皮层，促进胶原新生' },
      { icon: '🌡️', title: '智能温控', desc: 'NTC实时监测皮肤温度，安全不烫伤' },
      { icon: '✨', title: '胶原新生', desc: '刺激成纤维细胞活性，提升肌肤弹性' },
      { icon: '🎮', title: '多档调节', desc: '3档能量强度自由调节，适配不同肤质' }
    ],
    scenes: [
      { icon: '👩', text: '抗初老护理' },
      { icon: '💆', text: '面部提升紧致' },
      { icon: '🏠', text: '居家美容护理' }
    ],
    options: [
      { key: 'chassis', name: '机箱样式', required: true, values: [
        { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
        { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' }
      ]},
      { key: 'handle', name: '手柄样式', required: true, values: [
        { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
        { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
        { id: 'h3', label: '双头手柄', desc: '一机双探头', icon: '🔱' }
      ]},
      { key: 'bracket', name: '支架样式', required: false, values: [
        { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
        { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
        { id: 'b2', label: '滚轮推车', desc: '带轮移动推车', icon: '🛒' }
      ]}
    ]
  },
  {
    id: 3, name: '射频紧肤仪', model: 'BI-RF400',
    desc: '采用多极射频技术，深入真皮层刺激胶原蛋白再生，有效紧致肌肤、淡化皱纹。',
    imgText: '射频紧肤仪',
    params: [
      { label: '产品型号', value: 'BI-RF400' },
      { label: '射频频率', value: '1.0MHz' },
      { label: '电极数量', value: '4极' },
      { label: '工作模式', value: '射频/震动/加热' },
      { label: '产品重量', value: '200g' },
      { label: '防水等级', value: 'IPX6' }
    ],
    features: [
      { icon: '🔥', title: '多极射频', desc: '4极射频均匀加热真皮层' },
      { icon: '🔄', title: '旋转按摩', desc: '360°旋转贴合面部曲线' },
      { icon: '🌡️', title: '智能温控', desc: '实时监测皮肤温度，安全不烫伤' },
      { icon: '📊', title: '多档调节', desc: '3档能量自由选择' }
    ],
    scenes: [
      { icon: '👩', text: '抗初老护理' },
      { icon: '👨', text: '男士紧致' },
      { icon: '💆', text: '面部提升' },
      { icon: '🏥', text: '术后修复' }
    ],
    options: [
      { key: 'chassis', name: '机箱样式', required: true, values: [
        { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
        { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' }
      ]},
      { key: 'handle', name: '手柄样式', required: true, values: [
        { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
        { id: 'h3', label: '双头手柄', desc: '一机双探头', icon: '🔱' }
      ]},
      { key: 'bracket', name: '支架样式', required: false, values: [
        { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
        { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' }
      ]}
    ]
  },
  {
    id: 4, name: '光子嫩肤仪', model: 'BI-IPL500',
    desc: '强脉冲光技术，改善肤色不均、红血丝、毛孔粗大等问题，焕亮肌肤。',
    imgText: '光子嫩肤仪',
    params: [
      { label: '产品型号', value: 'BI-IPL500' },
      { label: '光照强度', value: '3-25J/cm²' },
      { label: '光谱范围', value: '530-1200nm' },
      { label: '闪光次数', value: '≥100,000次' },
      { label: '产品重量', value: '250g' },
      { label: '输入电压', value: '100-240V' }
    ],
    features: [
      { icon: '💡', title: '强脉冲光', desc: '宽光谱覆盖多种皮肤问题' },
      { icon: '🎯', title: '精准滤波', desc: '多种滤波片针对性治疗' },
      { icon: '🛡️', title: '皮肤传感', desc: '智能识别肤色自动调节' },
      { icon: '📈', title: '效果追踪', desc: 'APP记录护理进度' }
    ],
    scenes: [
      { icon: '☀️', text: '晒后修复' },
      { icon: '🌸', text: '美白焕肤' },
      { icon: '🔴', text: '红血丝改善' },
      { icon: '⬜', text: '毛孔细致' }
    ],
    options: [
      { key: 'chassis', name: '机箱样式', required: true, values: [
        { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
        { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
        { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' }
      ]},
      { key: 'handle', name: '手柄样式', required: true, values: [
        { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
        { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' }
      ]},
      { key: 'bracket', name: '支架样式', required: false, values: [
        { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
        { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' }
      ]}
    ]
  },
  {
    id: 5, name: '超声波导入仪', model: 'BI-US600',
    desc: '高频超声波振动，促进护肤品有效成分深层渗透，提升护肤效果。',
    imgText: '超声波导入仪',
    params: [
      { label: '产品型号', value: 'BI-US600' },
      { label: '超声波频率', value: '3MHz' },
      { label: '振动模式', value: '连续/脉冲' },
      { label: '产品重量', value: '120g' },
      { label: '电池容量', value: '800mAh' },
      { label: '防水等级', value: 'IPX5' }
    ],
    features: [
      { icon: '🌊', title: '高频振动', desc: '每秒300万次超声波振动' },
      { icon: '💧', title: '深层导入', desc: '将精华导入皮肤基底层' },
      { icon: '🎵', title: '温和护理', desc: '无刺激，敏感肌适用' },
      { icon: '🪶', title: '轻巧便携', desc: '仅120g，随身携带' }
    ],
    scenes: [
      { icon: '💧', text: '精华导入' },
      { icon: '🧴', text: '面膜增效' },
      { icon: '👁️', text: '眼部护理' },
      { icon: '💄', text: '日常护肤' }
    ],
    options: [
      { key: 'chassis', name: '机箱样式', required: true, values: [
        { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
        { id: 'c4', label: '马卡龙粉', desc: '磨砂樱花粉', icon: '🌸' }
      ]},
      { key: 'handle', name: '手柄样式', required: true, values: [
        { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
        { id: 'h4', label: '轻量便携', desc: '超轻旅行手柄', icon: '🪶' }
      ]},
      { key: 'bracket', name: '支架样式', required: false, values: [
        { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
        { id: 'b3', label: '便携收纳盒', desc: '磁吸旅行盒', icon: '📦' }
      ]}
    ]
  },
  {
    id: 6, name: '微电流提拉仪', model: 'BI-MC700',
    desc: '微电流刺激肌肉层，即时提拉紧致，塑造面部轮廓线条。',
    imgText: '微电流提拉仪',
    params: [
      { label: '产品型号', value: 'BI-MC700' },
      { label: '微电流强度', value: '50-500μA' },
      { label: '波形模式', value: '正弦波/方波/脉冲' },
      { label: '电极材质', value: '24K镀金' },
      { label: '产品重量', value: '150g' },
      { label: '供电方式', value: '内置锂电池' }
    ],
    features: [
      { icon: '⚡', title: '微电流技术', desc: '模拟人体生物电刺激肌肉' },
      { icon: '👑', title: '镀金电极', desc: '24K镀金，导电性优异' },
      { icon: '🎨', title: '多种波形', desc: '3种波形适应不同需求' },
      { icon: '📱', title: 'APP控制', desc: '蓝牙连接智能调控' }
    ],
    scenes: [
      { icon: '👩', text: 'V脸塑形' },
      { icon: '👨', text: '下颌线提升' },
      { icon: '👁️', text: '眼周紧致' },
      { icon: '🎭', text: '急救护理' }
    ],
    options: [
      { key: 'chassis', name: '机箱样式', required: true, values: [
        { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
        { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' },
        { id: 'c5', label: '香槟金', desc: '电镀香槟金', icon: '🥂' }
      ]},
      { key: 'handle', name: '手柄样式', required: true, values: [
        { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
        { id: 'h5', label: '双球滚珠', desc: '24K镀金滚珠', icon: '⚜️' }
      ]},
      { key: 'bracket', name: '支架样式', required: false, values: [
        { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
        { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
        { id: 'b4', label: '无线充电底座', desc: '感应充电立座', icon: '🔌' }
      ]}
    ]
  },
  {
    id: 7, name: '微电流美容仪', model: 'BI-MS100',
    desc: '微电流刺激面部肌肉提升紧致，配合导入功能增强护肤品吸收，轻松打造V脸轮廓。',
    imgText: '微电流美容仪',
    params: [
      { label: '产品型号', value: 'BI-MS100' },
      { label: '微电流', value: '50-500μA' },
      { label: '工作模式', value: '3种模式' },
      { label: '电极材质', value: '不锈钢导头' },
      { label: '产品重量', value: '130g' },
      { label: '充电方式', value: 'Type-C快充' }
    ],
    features: [
      { icon: '⚡', title: '微电流提升', desc: '模拟人体生物电刺激面部肌肉，即时提拉紧致' },
      { icon: '💎', title: '离子导入', desc: '负离子促进护肤品有效成分深层渗透吸收' },
      { icon: '🎮', title: '多种模式', desc: '3种护理模式适配不同肌肤状态需求' },
      { icon: '🪶', title: '轻巧便携', desc: '仅130g，随身携带随时护理' }
    ],
    scenes: [
      { icon: '👩', text: 'V脸塑形提升' },
      { icon: '💧', text: '精华导入增效' },
      { icon: '🎭', text: '晨间急救消肿' }
    ],
    options: [
      { key: 'chassis', name: '机箱样式', required: true, values: [
        { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
        { id: 'c4', label: '马卡龙粉', desc: '磨砂樱花粉', icon: '🌸' }
      ]},
      { key: 'handle', name: '手柄样式', required: true, values: [
        { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
        { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' }
      ]},
      { key: 'bracket', name: '支架样式', required: false, values: [
        { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
        { id: 'b3', label: '便携收纳盒', desc: '磁吸旅行盒', icon: '📦' }
      ]}
    ]
  }
];

// ===== 皮肤检测类 =====
const skinDevices = [
  {
    id: 8, name: '智能皮肤分析仪', model: 'BI-SK100',
    desc: 'AI智能识别，多维分析肌肤水分、油分、弹性、色素等指标。',
    imgText: '智能皮肤分析仪',
    params: [
      { label: '产品型号', value: 'BI-SK100' },
      { label: '分析维度', value: '水分/油分/弹性/色素/毛孔' },
      { label: '传感器', value: '高精度生物传感器' },
      { label: '连接方式', value: '蓝牙5.0' },
      { label: '产品重量', value: '80g' },
      { label: '电池容量', value: '500mAh' }
    ],
    features: [
      { icon: '🤖', title: 'AI智能分析', desc: '深度学习算法精准评估' },
      { icon: '📊', title: '多维检测', desc: '5大维度全面分析肌肤状态' },
      { icon: '📱', title: '报告生成', desc: 'APP自动生成护理建议' },
      { icon: '📈', title: '趋势追踪', desc: '记录肌肤变化趋势' }
    ],
    scenes: [
      { icon: '🏠', text: '家庭自测' },
      { icon: '💆', text: '美容院线' },
      { icon: '🏪', text: '护肤品门店' },
      { icon: '🏥', text: '皮肤管理中心' }
    ]
  },
  {
    id: 9, name: '专业皮肤镜', model: 'BI-SK200',
    desc: '高清放大成像，深层观测皮肤纹理、毛孔、斑点和炎症情况。',
    imgText: '专业皮肤镜',
    params: [
      { label: '产品型号', value: 'BI-SK200' },
      { label: '放大倍数', value: '50-200x' },
      { label: '分辨率', value: '1080P' },
      { label: '光源', value: 'LED环形无影灯' },
      { label: '产品重量', value: '100g' },
      { label: '接口', value: 'Type-C/USB' }
    ],
    features: [
      { icon: '🔍', title: '高清放大', desc: '最高200倍显微成像' },
      { icon: '💡', title: '无影照明', desc: 'LED环形灯消除阴影' },
      { icon: '📸', title: '拍照记录', desc: '一键拍照留存档案' },
      { icon: '📋', title: '对比分析', desc: '历史对比评估效果' }
    ],
    scenes: [
      { icon: '🏥', text: '皮肤科诊断' },
      { icon: '💆', text: '美容院检测' },
      { icon: '🏠', text: '个人皮肤管理' },
      { icon: '🔬', text: '学术研究' }
    ]
  },
  {
    id: 10, name: '皮肤水分测试仪', model: 'BI-SK300',
    desc: '精密传感器，快速准确测量皮肤角质层含水量。',
    imgText: '皮肤水分测试仪',
    params: [
      { label: '产品型号', value: 'BI-SK300' },
      { label: '测量范围', value: '0-100%' },
      { label: '传感器', value: '电容式精密传感器' },
      { label: '响应时间', value: '<2秒' },
      { label: '产品重量', value: '50g' },
      { label: '供电方式', value: '纽扣电池' }
    ],
    features: [
      { icon: '⏱️', title: '快速测量', desc: '2秒内出结果' },
      { icon: '🎯', title: '精准读数', desc: '高精度电容传感器' },
      { icon: '🪶', title: '超轻便携', desc: '仅50g，随身携带' },
      { icon: '🧹', title: '易清洁', desc: '防水传感器，一擦即净' }
    ],
    scenes: [
      { icon: '🏠', text: '日常护肤检测' },
      { icon: '💄', text: '护肤品效果评估' },
      { icon: '🏪', text: '门店体验服务' },
      { icon: '👶', text: '婴儿皮肤护理' }
    ]
  },
  {
    id: 11, name: '肤色检测仪', model: 'BI-SK400',
    desc: '专业肤色分析，提供精准的肤色数据和美白护理建议。',
    imgText: '肤色检测仪',
    params: [
      { label: '产品型号', value: 'BI-SK400' },
      { label: '测量维度', value: 'L*a*b*肤色值' },
      { label: '传感器', value: '光谱传感器' },
      { label: '光源', value: '标准D65光源' },
      { label: '产品重量', value: '70g' },
      { label: '连接方式', value: '蓝牙4.0' }
    ],
    features: [
      { icon: '🎨', title: '色彩分析', desc: 'L*a*b*国际标准肤色值' },
      { icon: '☀️', title: '美白评估', desc: '黑色素指数精准测量' },
      { icon: '📊', title: '趋势追踪', desc: '肤色变化曲线记录' },
      { icon: '💡', title: '护理建议', desc: '基于数据的美白方案' }
    ],
    scenes: [
      { icon: '☀️', text: '防晒效果评估' },
      { icon: '✨', text: '美白产品测试' },
      { icon: '💆', text: '美容院测肤' },
      { icon: '🏪', text: '护肤品推荐' }
    ]
  }
];

// ===== 清洁护理类 =====
const cleaningDevices = [
  {
    id: 12, name: '深层洁面仪', model: 'BI-CL300',
    desc: '声波震动技术，深入清洁毛孔，去除油脂和化妆品残留。',
    imgText: '深层洁面仪',
    params: [
      { label: '产品型号', value: 'BI-CL300' },
      { label: '振动频率', value: '300次/秒' },
      { label: '刷毛材质', value: '医用级硅胶' },
      { label: '产品重量', value: '110g' },
      { label: '电池容量', value: '600mAh' },
      { label: '防水等级', value: 'IPX7' }
    ],
    features: [
      { icon: '🔄', title: '声波振动', desc: '300次/秒高频振动' },
      { icon: '🧽', title: '硅胶刷头', desc: '医用级抗菌硅胶' },
      { icon: '🎮', title: '多档调节', desc: '4档强度适合不同肤质' },
      { icon: '🕐', title: '智能定时', desc: '1分钟自动关闭' }
    ],
    scenes: [
      { icon: '🧴', text: '日常洁面' },
      { icon: '💄', text: '卸妆清洁' },
      { icon: '🧑', text: '油性肌肤' },
      { icon: '👨', text: '男士护肤' }
    ]
  },
  {
    id: 13, name: '黑头导出仪', model: 'BI-CL500',
    desc: '真空吸附技术，温和导出黑头粉刺，不伤肌肤。',
    imgText: '黑头导出仪',
    params: [
      { label: '产品型号', value: 'BI-CL500' },
      { label: '吸附力', value: '30-60kPa' },
      { label: '吸头材质', value: '医用级PC' },
      { label: '产品重量', value: '130g' },
      { label: '电池容量', value: '800mAh' },
      { label: '防水等级', value: 'IPX6' }
    ],
    features: [
      { icon: '🌀', title: '真空吸附', desc: '30-60kPa可调节吸力' },
      { icon: '🔄', title: '多种吸头', desc: '4种吸头应对不同部位' },
      { icon: '🌡️', title: '热敷功能', desc: '温感打开毛孔更易导出' },
      { icon: '🛡️', title: '防夹设计', desc: '智能感应防损伤' }
    ],
    scenes: [
      { icon: '👃', text: '鼻部黑头' },
      { icon: '👄', text: '下巴闭口' },
      { icon: '🖐️', text: '指关节护理' },
      { icon: '🧑', text: '油性T区' }
    ]
  },
  {
    id: 14, name: '冷热喷雾仪', model: 'BI-CL600',
    desc: '纳米级喷雾粒子，热敷打开毛孔，冷敷收缩紧致。',
    imgText: '冷热喷雾仪',
    params: [
      { label: '产品型号', value: 'BI-CL600' },
      { label: '喷雾粒径', value: '0.3μm纳米级' },
      { label: '水箱容量', value: '80ml' },
      { label: '热喷温度', value: '40-45°C' },
      { label: '冷喷温度', value: '18-22°C' },
      { label: '产品重量', value: '350g' }
    ],
    features: [
      { icon: '☁️', title: '纳米喷雾', desc: '0.3μm纳米级细雾' },
      { icon: '🔥', title: '热敷模式', desc: '打开毛孔深层清洁' },
      { icon: '❄️', title: '冷敷模式', desc: '收缩毛孔镇定肌肤' },
      { icon: '💧', title: '大水箱', desc: '80ml一次满足护理' }
    ],
    scenes: [
      { icon: '🏠', text: '家庭补水护理' },
      { icon: '💆', text: '美容院辅助' },
      { icon: '🌡️', text: '换季敏感' },
      { icon: '🛌', text: '睡前舒缓' }
    ]
  },
  {
    id: 15, name: '去角质焕肤仪', model: 'BI-CL700',
    desc: '旋转刷头配合专用刷毛，温和去除老化角质，促进新陈代谢。',
    imgText: '去角质焕肤仪',
    params: [
      { label: '产品型号', value: 'BI-CL700' },
      { label: '转速', value: '150-300rpm' },
      { label: '刷毛材质', value: '超细纤维' },
      { label: '产品重量', value: '160g' },
      { label: '电池容量', value: '900mAh' },
      { label: '充电方式', value: '无线充电' }
    ],
    features: [
      { icon: '🔄', title: '旋转去角质', desc: '150-300rpm温和旋转' },
      { icon: '🧵', title: '超细纤维', desc: '比毛孔更细的纤维刷毛' },
      { icon: '🎯', title: '多刷头', desc: '面部/身体专用刷头' },
      { icon: '📱', title: '无线充电', desc: '感应充电方便卫生' }
    ],
    scenes: [
      { icon: '👩', text: '面部角质管理' },
      { icon: '🦶', text: '身体护理' },
      { icon: '💄', text: '护肤前准备' },
      { icon: '🧑', text: '粗糙肌肤' }
    ]
  }
];

/** 分类映射：索引 → 分类名 */
const CATEGORY_NAMES = {
  0: '美容仪器类',
  1: '皮肤检测类',
  2: '清洁护理类'
};

/** 按分类索引组织产品 */
const productsByCategory = {
  0: beautyDevices,
  1: skinDevices,
  2: cleaningDevices
};

/** 所有分类的索引列表 */
const CATEGORY_KEYS = Object.keys(productsByCategory).map(Number);

/**
 * 按 ID 查找产品（遍历所有分类）
 * @param {number} id 产品 ID
 * @returns {object|null} 产品对象或 null
 */
function findProductById(id) {
  for (const key of CATEGORY_KEYS) {
    const found = productsByCategory[key].find(p => p.id === id);
    if (found) return found;
  }
  return null;
}

/**
 * 获取指定分类的产品列表
 * @param {number} categoryIndex 分类索引
 * @returns {object[]} 产品列表
 */
function getProductsByCategory(categoryIndex) {
  return productsByCategory[categoryIndex] || [];
}

/**
 * 获取分类名
 * @param {number} categoryIndex
 * @returns {string}
 */
function getCategoryName(categoryIndex) {
  return CATEGORY_NAMES[categoryIndex] || '';
}

/**
 * 获取指定产品的选配维度
 * @param {number} id 产品 ID
 * @returns {object[]} 选配维度数组，未配置则返回空数组
 */
function getProductOptions(id) {
  const p = findProductById(id);
  return (p && Array.isArray(p.options)) ? p.options : [];
}

module.exports = {
  productsByCategory,
  CATEGORY_NAMES,
  CATEGORY_KEYS,
  findProductById,
  getProductsByCategory,
  getCategoryName,
  getProductOptions
};
