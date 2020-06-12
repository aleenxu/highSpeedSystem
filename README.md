# high-speed-system
* 智慧高速管控系统

# 安装
* npm install 
* cd high-speed-system
* npm run dev

# 打包-发布版本
* npm run build

# 代码规范
* 格式要求请遵循Eslint规范


# 文件模块

* 全局监控 ： MonitoringModule

* 管控业务  >  ControlModule
    - 预案库管理 ：ReservePlan
    - 管控基础数据管理  ：Basics

* 仿真优化 ：SimulationModule

* 统计分析  >StatisticsModule
    - 交通事件统计分析 ：Traffic
    - 管控方案统计分析 ：Plan

* 设备运维    >EquipmentModule
    - 可变情报板 ：Intelligence
    - 收费站 ：TollGate

* 系统管理  >SystemModule
    - 用户管理 ：User
    - 组织机构管理 ：Institution