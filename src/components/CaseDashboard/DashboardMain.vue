<template>
  <div v-if="visible" class="dashboard-root">
    <div class="dashboard-scale-wrapper" :style="scaleStyle">
      <!-- 头部：大屏标题与全局指标 -->
      <header class="dashboard-header">
        <div class="header-title">案件归因分析表盘</div>
        <div class="header-meta">
          <button class="accuracy-detail-btn" @click="accuracyModalVisible = true">
            <span class="btn-icon">📈</span>
            <span>归因分析数据概览</span>
          </button>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
      </header>

      <div class="dashboard-body">
        <!-- 加载蒙层 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">
              <span class="main-text">归因分析中...</span>
              <span class="percent-text">{{ analysisData?.progress || 0 }}%</span>
            </div>
            
            <!-- 进度条 -->
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: `${analysisData?.progress || 0}%` }"></div>
            </div>

            <!-- 步骤详情列表 -->
            <div class="steps-container">
              <div v-for="(step, index) in analysisData?.steps_log" :key="index" class="step-item" :class="step.status">
                <div class="step-icon">
                  <span v-if="step.status === 'done'">✓</span>
                  <span v-else-if="step.status === 'running'" class="step-spinner"></span>
                  <span v-else-if="step.status === 'skipped'">○</span>
                  <span v-else-if="step.status === 'error'">✕</span>
                  <span v-else>●</span>
                </div>
                <div class="step-info">
                  <div class="step-name">{{ step.name }}</div>
                  <div class="step-status-text" v-if="step.status === 'running'">{{ step.error || '正在处理...' }}</div>
                  <div class="step-status-text" v-else-if="step.status === 'done'">已完成 (耗时 {{ step.cost }}s)</div>
                  <div class="step-status-text" v-else-if="step.status === 'skipped'">已跳过</div>
                </div>
              </div>
            </div>

            <div class="loading-subtext">预计需要 1-2 分钟，当前：{{ analysisData?.message }}</div>
          </div>
        </div>

        <!-- 左侧：多要素 (1/3 宽度) -->
        <aside class="dashboard-left">
          <!-- 1.1 事件描述 -->
          <EventDescriptionCard 
            class="event-description-section"
            :detail="analysisData?.事件详情"
          />
          
          <!-- 1.2 事件画像与成因分析 -->
          <EventFactorCard 
            :profiling="analysisData?.事件画像" 
            :causes="analysisData?.成因分析" 
            :originProfiling="originData?.事件画像"
            :originCauses="originData?.成因分析"
            @open-correction="openCorrection"
          />
        </aside>

        <!-- 右侧：多维度展示 (2/3 宽度) - 上中下结构 -->
        <main class="dashboard-right-container">
          <!-- 2.1 维度选择 (上部分) -->
          <div class="right-top-nav">
            <DimensionSwitch 
              :dimensions="dimensions" 
              v-model:active-id="activeDimensionId"
            />
          </div>

          <!-- 维度详情 (中部分) -->
          <div class="right-middle-content" :class="{ 'full-height': ['duty', 'info', 'person', 'time'].includes(activeDimensionId) }">
            <Transition name="fade-content" mode="out-in">
              <!-- 时间维度 -->
              <TimeDimensionCard 
                v-if="activeDimensionId === 'time'"
                :data="analysisData?.时间维度数据"
                :originData="originData?.时间维度数据"
                :factors="currentFactors"
                :active-factor-name="activeFactorName"
                v-model:active-index="activeTimeNodeIndex"
                @open-correction="openCorrection"
              />

              <!-- 人物维度 (占据右侧全部) -->
              <PersonDimension
                v-else-if="activeDimensionId === 'person'"
                :data="analysisData?.人物维度数据"
                :originData="originData?.人物维度数据"
                @open-correction="openCorrection"
              />

              <!-- 权责维度 (占据右侧全部) -->
              <ResponsibilityDimension
                v-else-if="activeDimensionId === 'duty'"
                :data="analysisData?.驱动力维度数据"
                :originData="originData?.驱动力维度数据"
                @open-correction="openCorrection"
                @highlight-factor="handleFactorSelect"
              />

              <!-- 信息维度 (占据右侧全部) -->
              <InformationDimension
                v-else-if="activeDimensionId === 'info'"
                :data="analysisData?.信息维度数据"
                :originData="originData?.信息维度数据"
                @open-correction="openCorrection"
              />

              <!-- 其他维度占位 -->
              <div v-else class="placeholder-card-large">
                {{ dimensions.find(d => d.id === activeDimensionId)?.name }} 维度详情分析中...
              </div>
            </Transition>
          </div>
        </main>
      </div>
    </div>

    <!-- 数据校正 Modal -->
    <DataCorrectionModal
      v-if="correctionModalVisible"
      :visible="correctionModalVisible"
      :sectionName="activeSection.name"
      :sectionId="activeSection.id"
      :id="id"
      :allData="analysisData"
      :originData="originData"
      @close="correctionModalVisible = false"
      @update-all="handleDataUpdate"
    />

    <!-- 归因分析数据概览 Modal -->
    <AccuracyDetailModal
      v-if="accuracyModalVisible"
      :visible="accuracyModalVisible"
      @close="accuracyModalVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { analyzeCase, queryTaskProgress, getAnalysisDetail } from '../../api';
import EventFactorCard from './EventFactorCard.vue';
import EventDescriptionCard from './EventDescriptionCard.vue';
import DimensionSwitch from './DimensionSwitch.vue';
import TimeDimensionCard from './TimeDimensionCard.vue';
import ResponsibilityDimension from './ResponsibilityDimension.vue';
import InformationDimension from './InformationDimension.vue';
import PersonDimension from './PersonDimension.vue';
import DataCorrectionModal from '../DataCorrectionModal.vue';
import AccuracyDetailModal from '../AccuracyDetailModal.vue';

const props = defineProps({
  visible: Boolean,
  id: String,
  content: String
});

const mockResult = {
  "事件详情": `平江县刘某曾在某矿石选厂从事碎石工作，2014年6月刘某因病经平江县某医院诊断为肺结核。2015年12月29日，经岳阳市劳动能力鉴定委员会职工工伤与职业病致残程度鉴定伤残等级为肆级。2016年2月3日，矿石选厂与刘某签订工伤事故赔偿协议书。2016年3月16日，矿石选厂、平江县工伤保险基金管理服务中心与刘某签订有关伤残待遇协议，因其中部分条款没有兑现，刘某向平江县某镇人民调解委员会提出调解申请，要求解决工伤认定前误工工资、医疗费以及按国家规定缴纳基本养老保险费等问题，否则将上访。, 调解过程: 调委会征得刘某和矿石选厂同意后，开始实地走访与调查，发现双方的矛盾主要集中在以下几点：一是刘某工伤认定前的误工和医疗费用补偿问题；二是刘某工伤认定后养老保险投缴问题。
经调解员分析后认为：1.刘某确诊肺结核之后，因病住院治疗花费一定的医疗费用一直没有协商处理到位，加之其因病部分丧失劳动能力，影响其正常谋取生计。因此，刘某提出的该项主张理应得到相应补偿。2.刘某与矿石选厂之前就此事协调多年，虽然始终没有和解，但已达成有关协议。调解的基础良好，但要注意调解方式，尽量围绕双方已达成的协议进行妥善处理。3.此纠纷持续多年没有化解，究其原因是刘某养老保险投缴问题难以按照程序办理相关手续。因此做通刘某的工作，寻求变通，顺利完成社保投缴是解决此次纠纷的关键。
鉴于以上情况，调解员多次前往平江县社保中心进行咨询，了解到刘某与矿石选厂按照之前双方达成的协议兑现刘某的职工养老保险投缴事宜确实存在较大难度。为此，调解员多次与镇社保站商讨解决方案，恰逢当前有正在实施的农村失地养老保险投保政策，于是考虑到刘某是否有变换投保险种的可能性。在得到县社保中心的确认后，2018年12月13日，调解会召集刘某、矿石选厂相关负责人参与调解。矛盾焦点围绕刘某的主张展开，矿石选厂负责人认为之前已经作出相应补偿并签订协议，不能接受刘某关于补偿其工伤认定前的误工和医疗费用的请求，但对于承诺为刘某投缴养老保险没有异议，只是多次到社保中心都无法办理手续到位。
针对双方之间的矛盾，调解员根据法律规定认为刘某主张有理有据且合乎法律和国家政策，双方虽曾达成相应补偿协议，但没有涉及刘某工伤认定前的误工及医疗等补偿费用，故选厂一方应当予以适当考虑；至于刘某养老保险投缴问题，双方意见一致，只是碍于现行政策难以落实到位，调解员详细言明之前与社保部门进行的一系列商议和对接情况，一方面肯定选厂方解决问题的诚意，另一方面证实兑现刘某职工养老保险投保事宜存在较大难度，打消刘某对选厂的抵触情绪，同时引导其采取变通手段，以便更好地处理好此次事件，更大程度地维护自身合法权益，也了却心结。
最终在调解员积极解读《工伤保险条例》相关规定，以及动之以情，晓之以理的耐心劝导下，矿石选厂方作出让步，愿意根据《工伤保险条例》就刘某工伤认定前的误工和医疗费用进行适当补偿。随后，调解员站在刘某角度，充分考虑其正当利益，告知其上访不是解决问题的有效手段，最终落地点还在于基层、在于其本人，并进一步引导其没有必要过分纠结一定要投缴职工养老保险，毕竟闹了这么多年，心力交瘁不说，还于事无补。在刘某摇摆不定之际，调解员适时提出抓住此次农村失地养老保险投缴政策机遇的建议，引导其切莫错失机会，导致事情继续无限期拖延，以致身心俱疲。通过以情说理、以理服人、后果预期等方式，刘某最终接受调解员建议，愿意作出变通，转而投缴农村失地农民养老保险。, 调解结果: 2017年12月13日，双方共同签订调解协议书，内容如下：  
1、某矿石选厂一次性补偿刘某在工伤认定前误工工资、医疗费、鉴定费等一切费用43000元，并于协议签订时兑现；
2、刘某自愿同意按失地农民养老保险投保，对此刘某不再存任何异议；
3、矿石选厂一次性支付刘某养老保险费共计人民币97020元，并于协议签订时全部付清。此笔费用支付后，刘某未投保或投保后需要再续保的责任或费用由刘某全部承担。, 案例点评: 劳动争议纠纷是现实中较为常见的纠纷，用人单位与职工建立劳动关系后，一般都能相互合作，认真履行劳动合同，但由于各种原因，双方之间产生纠纷也是难以避免的事情。对此类纠纷，《劳动法》等相关法律有着较为详尽的规定，因此在调解协商时，应当坚持以法律为准绳，充分调查取证，彻底掌握清楚双方在履行劳动关系中的实际情况，立足双方平等协商、互谅互让的原则，建立和谐友好的调解环境，积极妥善化解矛盾纠纷。
本案的调解员准确把握住两点，首先站在法律的角度，确定双方在劳动关系中应当履行的相应义务，而其中涉及的社会保险投缴既是劳动者的一项权利，也是用人单位必须履行的义务。正是基于此，调解过程中，通过明确选厂所尽义务，促使选厂主动承担相应责任，共同维护劳动者合法权益。同时，考虑到兑现职工养老保险面临困难，站在以情感和解的角度，最大限度地维护劳动者合法权利，同时结合法、理所在，降低了刘某的预期，消除了刘某的顾虑，促使其做出让步，接受变通投保的建议，最终达成和解。`,
  "事件画像": [ "工伤争议", "劳动纠纷", "社保投缴", "历史遗留" ],
  "成因分析": [
    { "tag": "伤残待遇未兑现", "percentage": 35.0 },
    { "tag": "政策执行难度大", "percentage": 25.0 },
    { "tag": "双方预期偏差", "percentage": 25.0 },
    { "tag": "沟通渠道不畅", "percentage": 15.0 }
  ],
  "人物维度数据": {
    "summary": "人物变量深度解码：识别关键当事人的动机、认知偏差及致因特征。",
    "characters": [
      {
        "name": "刘某",
        "role": "当事人 (劳动者)",
        "type": "生存焦虑型",
        "avatar": "👤",
        "drivers": [
          { "label": "老有所养", "desc": "核心动力是因丧失劳动能力后，对未来生活保障的极端渴望。" },
          { "label": "公平补偿", "desc": "认为此前的协议未涵盖误工费，是对其劳动价值的剥削。" }
        ],
        "biases": [
          { "label": "上访迷思", "desc": "坚信“事情闹大才能解决”，忽视了政策底层的物理性限制。" },
          { "label": "协议不信任", "desc": "因部分条款未兑现，对任何新协议产生预设性的排斥心理。" }
        ],
        "attribution": "刘某的“生存高度恐惧”是案件长期僵持的主观内核。他将社保视作唯一的安全感来源，导致其在调解中表现出极高的防御性和偏执，任何不包含社保补缴的方案都会被其解读为恶意欺骗。"
      },
      {
        "name": "选厂负责人",
        "role": "当事人 (企业代表)",
        "type": "合规防御型",
        "avatar": "🏢",
        "drivers": [
          { "label": "成本控制", "desc": "严格执行企业法律成本精算，防止出现“法外补偿”的先例。" },
          { "label": "合规避责", "desc": "坚持以已签协议为边界，规避可能的审计或合规风险。" }
        ],
        "biases": [
          { "label": "法务逻辑优先", "desc": "过度依赖法律条款的字面解释，忽视了基层治理中的人情与变通。" },
          { "label": "行政障碍预设", "desc": "认为既然社保中心无法补缴，则该问题属于“不可抗力”，企业无须再行努力。" }
        ],
        "attribution": "负责人的“纯法务逻辑优先”是案件升级推手。企业侧由于缺乏对弱势群体生存困境的同理心，在沟通中表现出冷冰冰的僵化态度，这种态度直接激发了刘某的对抗情绪，使简单的经济争议演变为复杂的社会信访问题。"
      },
    ]
  },
  "时间维度数据": {
    "summary": "本案历经四年，从最初的病痛诊断到最终的社保政策变通，体现了基层治理的复杂性。",
    "timeline": [
      { 
        "date": "2014-06", 
        "event": "刘某诊断为肺结核", 
        "nodeFactors": [
          { "name": "经济要素", "content": "诊断初期，刘某面临高额医疗支出，且因病无法继续工作，经济来源中断，生活陷入困境。" },
          { "name": "心理要素", "content": "刘某被确诊后心理极度恐惧，对未来生活感到绝望，情绪波动剧烈。" }
        ]
      },
      { 
        "date": "2015-12", 
        "event": "鉴定为伤残肆级", 
        "nodeFactors": [
          { "name": "法律要素", "content": "经岳阳市劳动能力鉴定委员会鉴定，刘某伤残等级为肆级，这为其后续主张工伤赔偿提供了关键的法律依据。" }
        ]
      },
      { 
        "date": "2016-02", 
        "event": "签订赔偿协议书", 
        "nodeFactors": [
          { "name": "经济要素", "content": "矿石选厂与刘某签订工伤事故赔偿协议书，涉及初步的经济补偿支付，缓解了刘某的部分经济压力。" },
          { "name": "法律要素", "content": "双方在法律框架下达成首份正式协议，明确了选厂的赔偿责任，但由于条款未完全兑现，埋下了后续纠纷的伏笔。" }
        ]
      },
      { 
        "date": "2018-12", 
        "event": "提出调解申请", 
        "nodeFactors": [
          { "name": "心理要素", "content": "由于前期协议未兑现，刘某产生极强的抵触 and 焦虑情绪，甚至产生上访念头，心理博弈进入白热化。" },
          { "name": "社会要素", "content": "刘某向人民调解委员会求助，基层社会治理力量开始介入，尝试通过非诉讼手段化解矛盾。" }
        ]
      },
      { 
        "date": "2018-12-13", 
        "event": "达成最终调解协议", 
        "nodeFactors": [
          { "name": "政策要素", "content": "利用“农村失地养老保险”这一关键政策变通，解决了原本卡壳多年的社保补缴死结，成为案件突破的基石。" },
          { "name": "经济要素", "content": "最终达成14万余元的总补偿方案，一次性解决了误工、医疗及社保费用，实现了经济层面的彻底清结。" }
        ]
      }
    ]
  },
  "信息维度数据": {
    "summary": "认知偏差解码：通过对比当事人的主观预设与客观事实，识别导致调解僵局的关键信息断层。",
    "items": [
        {
          "category": "社保性质认知",
          "subjective": {
            "text": "厂方故意推诿，不愿按照国家规定为我投缴城镇职工养老保险。",
            "tags": ["受害者心态", "故意猜测"]
          },
          "objective": {
            "text": "由于此前中断投缴多年且政策变动，现行程序下无法直接补缴职工险。",
            "tags": ["政策瓶颈", "物理受阻"]
          }
        },
        {
          "category": "补偿范围认知",
          "subjective": {
            "text": "以前签的协议没涵盖误工费，厂方是在钻法律空子，剥削劳动者。",
            "tags": ["分配不公感"]
          },
          "objective": {
            "text": "原协议虽具法律效力，但确实未涵盖工伤认定前的误工及医疗支出部分。",
            "tags": ["法律空白", "合理主张"]
          }
        },
        {
          "category": "解决路径认知",
          "subjective": {
            "text": "如果不答应我的要求，我就继续上访，只有把事情闹大才能解决。",
            "tags": ["对抗思维"]
          },
          "objective": {
            "text": "上访无法改变社保底层数据，且显著增加身心成本，无法获得实质收益。",
            "tags": ["后果可控", "成本分析"]
          }
        }
    ]
  },
  "驱动力维度数据": {
    "summary": "动力平衡归因分析：通过模拟案件发生前的驱动力与约束力博弈，识别导致失衡的关键致因。",
    "states": [
      {
        "name": "失衡诱发",
        "status": "致因状态：驱动力显著超过约束力，案件诱发",
        "leftWeights": [
          { "name": "养老保险补缴诉求", "value": 50, "describe": "当事人对特定结果的强烈主觉诉求，通常是导致僵局的核心驱动项。" },
          { "name": "医疗/误工补偿驱动", "value": 40, "describe": "当事人基于特定权利主张提出的要求，构成案件的主要驱动力。" }
        ],
        "rightWeights": [
          { "name": "法律程序限制", "value": 30, "describe": "主体应尽的法律或契约义务，属于基础约束项。" },
          { "name": "历史协议约束", "value": 20, "describe": "主体基于外部环境或社会责任作出的承诺，起到一定的抑制/平衡作用。" }
        ]
      },
      {
        "name": "动力干预",
        "status": "致育状态：引入外部干预变量，尝试重构平衡",
        "leftWeights": [
          { "name": "养老保险补缴诉求", "value": 50, "describe": "当事人对特定结果的强烈主觉诉求，通常是导致僵局的核心驱动项。" },
          { "name": "医疗/误工补偿驱动", "value": 40, "describe": "当事人基于特定权利主张提出的要求，构成案件的主要驱动力。" }
        ],
        "rightWeights": [
          { "name": "法律程序限制", "value": 30, "describe": "主体应尽的法律或契约义务，属于基础约束项。" },
          { "name": "历史协议约束", "value": 20, "describe": "主体基于外部环境或社会责任作出的承诺，起到一定的抑制/平衡作用。" },
          { "name": "政策变通抑制力", "value": 35, "describe": "主体为达成平衡而作出的额外让步 or 资源投入。" }
        ]
      },
      {
        "name": "归因闭环",
        "status": "致因状态：动力达成动态平衡，风险化解",
        "analysis": [
          "1. 核心矛盾已通过外部变量实现对冲；",
          "2. 驱动力与约束力在当前节点达成动态平衡；",
          "3. 行为动机被有效抑制，案件触发风险降低。"
        ],
        "leftWeights": [
          { "name": "养老保险补缴诉求", "value": 50, "describe": "当事人对特定结果的强烈主觉诉求，通常是导致僵局的核心驱动项。" },
          { "name": "医疗/误工补偿驱动", "value": 40, "describe": "当事人基于特定权利主张提出的要求，构成案件的主要驱动力。" }
        ],
        "rightWeights": [
          { "name": "法律程序限制", "value": 30, "describe": "主体应尽的法律或契约义务，属于基础约束项。" },
          { "name": "历史协议约束", "value": 20, "describe": "主体基于外部环境或社会责任作出的承诺，起到一定的抑制/平衡作用。" },
          { "name": "政策变通抑制力", "value": 35, "describe": "主体为达成平衡而作出的额外让步 or 资源投入。" },
          { "name": "心理预期回归", "value": 15, "describe": "心态转变或认知更新带来的正向拉力，有效抵消了冲突驱动力。" }
        ]
      }
    ]
  }
};


const emit = defineEmits(['close', 'update-data']);

const analysisData = ref(null);
const loading = ref(false);
const originData = ref(null);
const dataChanged = ref(false);

const dimensions = [
  { id: 'time', name: '时间维度' },
  { id: 'person', name: '人物维度' },
  { id: 'duty', name: '驱动力维度' },
  { id: 'info', name: '信息维度' }
];

// 数据校正 Modal 状态
const correctionModalVisible = ref(false);
const accuracyModalVisible = ref(false);
const activeSection = ref({ name: '', id: '' });

const openCorrection = (name, id) => {
  activeSection.value = { name, id };
  correctionModalVisible.value = true;
};

const handleDataUpdate = (newData) => {
  console.log('收到全量校正数据:', newData);
  analysisData.value = newData;
  emit('update-data', newData);
};

// 获取详情或启动分析逻辑
const fetchDetailOrAnalyze = async (id) => {
  if (!id) return;
  
  loading.value = true;
  try {
    const res = await getAnalysisDetail(id);
    // 根据接口3返回结构：{ origin: {}, new: {} }
    if (res.data && (res.data.new || res.data.origin)) {
      analysisData.value = res.data.new || res.data.origin;
      originData.value = res.data.origin;
      dataChanged.value = res.data.new ? true : false;
      loading.value = false;
    } else {
      // 详情不存在，启动分析
      await startAnalysis(id);
    }
  } catch (error) {
    console.error('获取详情失败，尝试启动分析:', error);
    await startAnalysis(id);
  }
};

const startAnalysis = async (id) => {
  if (!id) {
    alert('获取案件ID错误');
    return;
  }
  loading.value = true;
  analysisData.value = null;
  
  try {
    // mock数据
    // console.log('mock数据', id);
    // await new Promise(resolve => setTimeout(resolve, 3000));
    // analysisData.value = mockResult; // 清空旧数据
    // return 

    const startResult = await analyzeCase({ 
      content: props.content,
      id: id
    });
    const taskId = startResult.data?.task_id;

    if (!taskId) {
      throw new Error('服务器未返回任务ID');
    }

    let isFinished = false;
    while (!isFinished) {
      const queryResult = await queryTaskProgress(taskId, id);
      const taskData = queryResult.data;

      if (!taskData) {
        throw new Error('查询结果异常');
      }

      if (taskData.status === 'success') {
        analysisData.value = taskData.result;
        isFinished = true;
      } else if (taskData.status === 'failed' || taskData.status === 'error') {
        throw new Error(taskData.current_message || '分析任务执行失败');
      } else {
        // 更新进度数据
        analysisData.value = { 
          polling: true, 
          progress: taskData.total_progress, 
          message: taskData.current_message,
          steps_log: taskData.steps_log
        };
        // 轮询进度，每5秒一次
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error('分析过程失败:', error);
    alert(error.message || '分析请求失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 监听 id 变动
watch(() => props.id, (newId) => {
  if (newId) {
    fetchDetailOrAnalyze(newId);
  }
}, { immediate: true });

// 设计稿尺寸
const DESIGN_WIDTH = 1820;
const DESIGN_HEIGHT = 880;

const scale = ref(1);

const updateScale = () => {
  const ww = window.innerWidth / DESIGN_WIDTH;
  const wh = window.innerHeight / DESIGN_HEIGHT;
  // 取最小比例，确保内容完整显示（等比例缩放，会有黑边）
  scale.value = ww < wh ? ww : wh;
};

const scaleStyle = computed(() => ({
  width: `${DESIGN_WIDTH}px`,
  height: `${DESIGN_HEIGHT}px`,
  transform: `scale(${scale.value}) translate(-50%, -50%)`,
  position: 'absolute',
  left: '50%',
  top: '50%',
  transformOrigin: '0 0',
  transition: 'transform 0.1s ease-out'
}));

onMounted(() => {
  updateScale();
  window.addEventListener('resize', updateScale);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScale);
});

const metrics = ref({ accuracy: '86.4%', f1_score: '0.86' });
const activeDimensionId = ref('time'); // 默认选中时间维度
const activeFactorName = ref('');
const activeTimeNodeIndex = ref(0); // 当前选中的时间节点索引

const currentFactors = computed(() => {
  // 如果当前是时间维度，且选中了某个节点，且该节点有特定要素拆解
  if (activeDimensionId.value === 'time' && 
      analysisData.value?.时间维度数据?.timeline?.[activeTimeNodeIndex.value]?.nodeFactors) {
    return analysisData.value?.时间维度数据?.timeline?.[activeTimeNodeIndex.value]?.nodeFactors || [];
  }
  // 否则返回空数组
  return [];
});

const handleFactorSelect = (name) => {
  activeFactorName.value = name;
};
</script>

<style scoped>
.dashboard-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #0a1b3e 0%, #050a19 100%);
  color: #fff;
  z-index: 2000;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.dashboard-scale-wrapper {
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  height: 70px;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);
  border-bottom: 2px solid rgba(0, 242, 255, 0.2);
  flex-shrink: 0;
}

.header-title {
  color: #00f2ff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.6);
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 25px;
}

.dashboard-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.dashboard-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.dashboard-left > * {
  flex: 1;
  min-height: 0; /* 允许子项在 flex 容器中收缩 */
}

.event-description-section {
  flex: 0 0 320px; /* 固定高度为 320px */
}

.dashboard-right-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.right-top-nav {
  flex: 0 0 auto;
}

.right-middle-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.right-middle-content.full-height {
  flex: 1 1 100%;
}

/* 确保 TimeDimensionCard 或占位符填充父容器 */
.right-middle-content > * {
  flex: 1;
  height: 100%;
}

.right-bottom-carousel {
  flex: 0 0 280px; /* 增加固定高度，防止交互时抖动 */
  min-height: 0;
}

.placeholder-card-large {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.1);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: #88b0ea;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}
.close-btn:hover { color: #fff; }

.accuracy-detail-btn, .re-analyze-btn {
  background: rgba(0, 242, 255, 0.15);
  border: 1px solid rgba(0, 242, 255, 0.4);
  color: #00f2ff;
  padding: 6px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.1);
}

.accuracy-detail-btn:hover, .re-analyze-btn:hover {
  background: rgba(0, 242, 255, 0.25);
  border-color: #00f2ff;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
  transform: translateY(-1px);
}

.re-analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.accuracy-detail-btn:active, .re-analyze-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
}

/* 加载蒙层 */
.loading-overlay {
  position: absolute;
  top: 70px; /* header height */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 10, 25, 0.9);
  backdrop-filter: blur(12px);
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 242, 255, 0.1);
  border-top: 3px solid #00f2ff;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  display: flex;
  align-items: baseline;
  gap: 12px;
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

.main-text {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
}

.percent-text {
  font-size: 18px;
  font-family: 'DIN Alternate', sans-serif;
  opacity: 0.8;
}

.progress-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0072ff, #00f2ff);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
  transition: width 0.5s ease;
}

.steps-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.step-item.running {
  opacity: 1;
  color: #00f2ff;
}

.step-item.done {
  opacity: 0.8;
  color: #4ade80;
}

.step-item.skipped {
  opacity: 0.4;
}

.step-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.step-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 242, 255, 0.2);
  border-top-color: #00f2ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.step-info {
  flex: 1;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
}

.step-status-text {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 2px;
}

.loading-subtext {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  text-align: center;
}

/* 切换动画 */
.fade-content-enter-active, .fade-content-leave-active {
  transition: all 0.3s ease;
}
.fade-content-enter-from { opacity: 0; transform: translateX(20px); }
.fade-content-leave-to { opacity: 0; transform: translateX(-20px); }
</style>

