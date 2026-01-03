<script setup>
import analyze from './components/analyze.vue'
import DashboardMain from './components/CaseDashboard/DashboardMain.vue'
import { ref, onMounted } from 'vue';
const analysisData = ref([]);
const dataIndex = ref(0);
const showNewDashboard = ref(true);

onMounted(() => {
  analysisData.value.push({
    "是否满足深度分析条件": true,
    "事件画像": [
      { "tag": "工伤争议", "count": 45, "percentage": 30 },
      { "tag": "劳动纠纷", "count": 60, "percentage": 40 },
      { "tag": "社保投缴", "count": 30, "percentage": 20 },
      { "tag": "历史遗留", "count": 15, "percentage": 10 }
    ],
    "核心成因分析": [
      { "tag": "伤残待遇未兑现", "count": 50, "percentage": 35 },
      { "tag": "政策执行难度大", "count": 40, "percentage": 25 },
      { "tag": "双方预期偏差", "count": 30, "percentage": 20 },
      { "tag": "沟通渠道不畅", "count": 30, "percentage": 20 }
    ],
    "要素雷达数据": [
      { "name": "经济要素", "value": 0.85 },
      { "name": "心理要素", "value": 0.70 },
      { "name": "政策要素", "value": 0.90 },
      { "name": "法律要素", "value": 0.60 },
      { "name": "社会要素", "value": 0.50 }
    ],
    "心理情绪数据": [
      { "time": "2014-06", "event": "确诊阶段", "person": "刘某", "emotion": "恐惧", "intensity": 0.8 },
      { "time": "2016-02", "event": "协议阶段", "person": "刘某", "emotion": "期待", "intensity": 0.6 },
      { "time": "2018-12", "event": "调解阶段", "person": "刘某", "emotion": "焦虑", "intensity": 0.9 },
      { "time": "2018-12", "event": "调解阶段", "person": "选厂负责人", "emotion": "防御", "intensity": 0.7 }
    ],
    "维度配置": [
      { "id": "time", "name": "时间维度", "enabled": true },
      { "id": "duty", "name": "权责维度", "enabled": true },
      { "id": "info", "name": "信息维度", "enabled": true },
      { "id": "space", "name": "空间维度", "enabled": false },
      { "id": "task", "name": "任务维度", "enabled": false }
    ],
    "时间维度数据": {
      "summary": "本案历经四年，从最初的病痛诊断到最终的社保政策变通，体现了基层治理的复杂性。",
      "timeline": [
        { "date": "2014-06", "event": "刘某诊断为肺结核", "factors": ["经济要素", "心理要素"] },
        { "date": "2015-12", "event": "鉴定为伤残肆级", "factors": ["法律要素"] },
        { "date": "2016-02", "event": "签订赔偿协议书", "factors": ["经济要素", "法律要素"] },
        { "date": "2018-12", "event": "提出调解申请", "factors": ["心理要素", "社会要素"] },
        { "date": "2018-12-13", "event": "达成最终调解协议", "factors": ["政策要素", "经济要素"] }
      ]
    },
    "信息维度数据": {
      "summary": "认知偏差解码：通过对比当事人的主观预设与客观事实，识别导致调解僵局的关键信息断层。",
      "items": [
        {
          "id": "bias-1",
          "category": "社保性质认知",
          "subjective": {
            "text": "厂方故意推诿，不愿按照国家规定为我投缴城镇职工养老保险。",
            "intensity": 0.85,
            "tags": ["受害者心态", "故意猜测"]
          },
          "objective": {
            "text": "由于此前中断投缴多年且政策变动，现行程序下无法直接补缴职工险。",
            "certainty": 0.95,
            "tags": ["政策瓶颈", "物理受阻"]
          },
          "bridge": "由‘主观故意’转为‘客观障碍’：引导理解政策限制，从而接受变通方案。"
        },
        {
          "id": "bias-2",
          "category": "补偿范围认知",
          "subjective": {
            "text": "以前签的协议没涵盖误工费，厂方是在钻法律空子，剥削劳动者。",
            "intensity": 0.70,
            "tags": ["分配不公感"]
          },
          "objective": {
            "text": "原协议虽具法律效力，但确实未涵盖工伤认定前的误工及医疗支出部分。",
            "certainty": 1.0,
            "tags": ["法律空白", "合理主张"]
          },
          "bridge": "承认主张合理性：确认厂方法律义务缺失，作为突破口要求其经济让步。"
        },
        {
          "id": "bias-3",
          "category": "解决路径认知",
          "subjective": {
            "text": "如果不答应我的要求，我就继续上访，只有把事情闹大才能解决。",
            "intensity": 0.90,
            "tags": ["对抗思维"]
          },
          "objective": {
            "text": "上访无法改变社保底层数据，且显著增加身心成本，无法获得实质收益。",
            "certainty": 0.88,
            "tags": ["后果可控", "成本分析"]
          },
          "bridge": "后果预期引导：对比‘上访无望’与‘政策变通即时收益’，引导理性回归。"
        }
      ]
    },
    "权责维度数据": {
      "summary": "基于博弈论的权责平衡分析：通过引入政策变通变量，降低了诉求的执行成本，实现了博弈均衡。",
      "states": [
        {
          "id": "initial",
          "name": "初始僵局",
          "status": "调解僵局：诉求过重且执行受阻",
          "leftWeights": [
            { "id": "L1", "name": "养老保险认缴", "value": 50, "type": "commitment", "isFloating": true },
            { "id": "L2", "name": "过往补偿协议", "value": 20, "type": "responsibility" }
          ],
          "rightWeights": [
            { "id": "R1", "name": "工伤前误工/医疗费", "value": 40, "type": "claim" },
            { "id": "R2", "name": "职工养老保险硬性要求", "value": 60, "type": "obsession" }
          ]
        },
        {
          "id": "mediating",
          "name": "动态加码",
          "status": "平衡调整中：引入政策变通",
          "leftWeights": [
            { "id": "L1", "name": "养老保险认缴", "value": 50, "type": "commitment", "isFloating": true },
            { "id": "L2", "name": "过往补偿协议", "value": 20, "type": "responsibility" },
            { "id": "L3", "name": "让步补偿:4.3万元", "value": 30, "type": "concession", "linkedFactor": "经济要素" }
          ],
          "rightWeights": [
            { "id": "R1", "name": "工伤前误工/医疗费", "value": 40, "type": "claim" },
            { "id": "R3", "name": "农村失地养老保险变通", "value": 30, "type": "compromise" }
          ]
        },
        {
          "id": "final",
          "name": "达成和解",
          "status": "达成和解点：完美博弈平衡",
          "leftWeights": [
            { "id": "L1", "name": "养老保险认缴", "value": 50, "type": "commitment" },
            { "id": "L2", "name": "过往补偿协议", "value": 20, "type": "responsibility" },
            { "id": "L3", "name": "让步补偿:4.3万元", "value": 30, "type": "concession" },
            { "id": "L4", "name": "支付97020元", "value": 45, "type": "final_payment" }
          ],
          "rightWeights": [
            { "id": "R1", "name": "工伤前误工/医疗费", "value": 40, "type": "claim" },
            { "id": "R3", "name": "农村失地养老保险变通", "value": 30, "type": "compromise" },
            { "id": "R4", "name": "放弃无效执念", "value": 75, "type": "psychological_balance" }
          ]
        }
      ]
    },
    "要素详情": [
      { "id": "economic", "name": "经济要素", "content": "补偿金额共计140,020元，包含误工工资、医疗费及失地农民养老保险费用。选厂承诺一次性全部付清，有效解决了当事人的核心生存诉求。", "type": "detail" },
      { "id": "psychological", "name": "心理要素", "content": "刘某多年纠纷心力交瘁，产生强烈焦虑与抵触情绪。选厂方持有防御心理。调解中采取“以情说理”策略，成功疏导双方对立情绪。", "type": "psychology" },
      { "id": "policy", "name": "政策要素", "content": "核心突破在于巧妙运用“农村失地农民养老保险”政策，化解了原有城镇职工养老保险难以按程序办理的死结。", "type": "detail" },
      { "id": "legal", "name": "法律要素", "content": "严格依据《工伤保险条例》进行伤残等级鉴定与待遇标准核算，确保调解方案在法律框架内合规合法。", "type": "detail" },
      { "id": "social", "name": "社会要素", "content": "案件涉及基层劳动者基本权益，对当地和谐劳动关系的构建具有示范效应，通过人民调解机制实现了定分止争。", "type": "detail" },
      { "id": "other", "name": "其他要素", "content": "矿石选厂的行业性质及当地招工环境也是调解中需要平衡的次要因素。", "type": "detail" }
    ]
  })
})
</script>

<template>
  <div class="app-container">
    <div class="controls">
      <button class="switch-btn" @click="dataIndex = (dataIndex+1)%analysisData.length">切换数据</button>
    </div>

    <!-- 旧版分析页面 -->
    <analyze v-if="!showNewDashboard" :visible="true" :analysisData="analysisData[dataIndex]" />

    <!-- 新版全屏大屏 -->
    <DashboardMain 
      v-else 
      :visible="true" 
      :analysisData="analysisData[dataIndex]" 
      @close="showNewDashboard = false"
    />
  </div>
</template>

<style scoped>
.controls {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 3000;
  display: flex;
  gap: 10px;
}

.switch-btn, .toggle-dash-btn {
  height: 24px;
  padding: 0 10px;
  background-color: #00f2ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.toggle-dash-btn {
  background-color: #ffcf40;
}
</style>
