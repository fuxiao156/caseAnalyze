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
      { "id": "space", "name": "空间维度", "enabled": false },
      { "id": "task", "name": "任务维度", "enabled": false },
      { "id": "duty", "name": "权责维度", "enabled": true },
      { "id": "info", "name": "信息维度", "enabled": false }
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
    }
  })
})
</script>

<template>
  <div class="app-container">
    <div class="controls">
      <button class="switch-btn" @click="dataIndex = (dataIndex+1)%analysisData.length">切换数据</button>
      <button class="toggle-dash-btn" @click="showNewDashboard = !showNewDashboard">
        {{ showNewDashboard ? '切换至旧版' : '查看新版大屏' }}
      </button>
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
