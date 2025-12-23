<script setup>
import analyze from './components/analyze.vue'
import { ref, onMounted } from 'vue';
const analysisData = ref([]);
const dataIndex = ref(0);

onMounted(() => {
  analysisData.value.push({
    "是否满足深度分析条件": true,
    "事件成因分析": ["合同条款缺失", "利益分配争议", "法律认知偏差"],
    "事件画像": ["合同纠纷", "赔偿纠纷"],
    "多维度分析": [
      { "维度名": "时间维度", "分析内容": "纠纷起始于2012年，跨度长达5年，具有明显的历史遗留特征。" },
      { "维度名": "权责维度", "分析内容": "核心争议点在于合同补充协议的法律效力认定不一。" }
    ],
    "多要素分析": [
      { "要素名": "经济要素", "分析内容": "涉及土地补偿金分配，是核心驱动力。", "关键性权重": 0.6 },
      { "要素名": "心理要素", "分析内容": "双方对调解结果存在预期落差，情绪波动大。", "关键性权重": 0.4 }
    ]
  })
  analysisData.value.push({
    "是否满足深度分析条件": false,
    "不可分析原因": "输入内容非案件详情",
    "事件成因分析": [],
    "事件画像": [],
    "多维度分析": [],
    "多要素分析": []
  })
  analysisData.value.push({
    "是否满足深度分析条件": false,
    "不可分析原因": "案情描述过于简单，缺乏起因、时间背景及具体经过，无法进行深度要素拆解。",
    "事件成因分析": [],
    "事件画像": ["矛盾纠纷"], 
    "多维度分析": [],
    "多要素分析": []
  })
})
</script>

<template>
  <button class="switch-btn" @click="dataIndex = (dataIndex+1)%analysisData.length">切换数据</button>
    <analyze
    :visible="true" :analysisData="analysisData[dataIndex]" />
</template>

<style scoped>
.switch-btn{
  height: 20px;
  width: 50px;
  background-color: #00f2ff;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 2000;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
