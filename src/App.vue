<script setup>
import analyze from './components/analyze.vue'
import { ref, onMounted } from 'vue';
const analysisData = ref([]);
const dataIndex = ref(0);

onMounted(() => {
  analysisData.value.push({
    "是否满足深度分析条件": true,
    "事件画像": ["工伤争议", "劳动纠纷", "社保投缴", "历史遗留"],
    "核心成因分析": ["伤残待遇未兑现", "政策执行难度大", "双方预期存在偏差"],
    "多维度分析": [
      { 
        "维度名": "时间维度", 
        "分析内容": "案件跨度长达4年（2014-2018），涉及多个关键时间节点，具有明显的长期性。",
        "时间轴数据": [
          { "date": "2014-06", "event": "刘某诊断为肺结核", "type": "origin" },
          { "date": "2015-12", "event": "鉴定为伤残肆级", "type": "milestone" },
          { "date": "2016-02", "event": "签订赔偿协议书", "type": "action" },
          { "date": "2018-12", "event": "提出调解申请", "type": "trigger" },
          { "date": "2018-12-13", "event": "达成最终调解协议", "type": "success" }
        ]
      },
      { 
        "维度名": "权责维度", 
        "分析内容": "矿石选厂需承担伤残待遇，社保中心提供政策支持，调解委会协调平衡。",
        "利益相关方": [
          { "party": "刘某", "role": "申请人", "concern": "经济补偿与社保保障", "emotion": "焦虑/坚持" },
          { "party": "矿石选厂", "role": "被申请人", "concern": "责任终结与成本控制", "emotion": "防御/配合" },
          { "party": "调解委员会", "role": "中立方", "concern": "化解矛盾/定分止争", "emotion": "耐心/专业" },
          { "party": "社保中心", "role": "支持方", "concern": "政策落实与合规性", "emotion": "严谨" }
        ]
      }
    ],
    "多要素分析": [
      { "要素名": "经济要素", "分析内容": "涉及误工工资、医疗费及养老金共计14万余元。", "关键性权重": 0.8 },
      { "要素名": "心理要素", "分析内容": "刘某由于多年纠纷产生严重的抵触和焦虑情绪。", "关键性权重": 0.6 },
      { "要素名": "政策要素", "分析内容": "利用失地农民养老保险政策化解职工保险办理难题。", "关键性权重": 0.9 },
      { "要素名": "法律要素", "分析内容": "基于《工伤保险条例》进行权责划分。", "关键性权重": 0.5 },
      { "要素名": "调解要素", "分析内容": "动之以情、晓之以理的劝导与方案变通。", "关键性权重": 0.7 }
    ],
    "调解流程": [
      { "step": "受理案件", "desc": "接受刘某申请，介入纠纷" },
      { "step": "调查走访", "desc": "实地核实，锁定争议焦点" },
      { "step": "多方联动", "desc": "对接社保中心，寻找变通方案" },
      { "step": "耐心劝导", "desc": "引导当事人调整预期" },
      { "step": "达成协议", "desc": "签订书面协议，当场兑现" }
    ],
    "调解结果展示": {
        "总补偿金额": 140020,
        "细分项": [
            { "label": "误工及医疗费", "value": 43000 },
            { "label": "一次性养老保险费", "value": 97020 }
        ],
        "变通点": "投缴农村失地农民养老保险"
    }
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
