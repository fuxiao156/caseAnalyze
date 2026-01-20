## 面板组件
import DashboardMain from './components/CaseDashboard/DashboardMain.vue'

 
## 使用方式
<DashboardMain 
    :visible="isDashboardVisible"  // 控制是否展示
    :id="currentAnalysisId" // 案件id
    :content="inputText" // 案件详情
    @close="handleClose" // 关闭事件触发器
/>

// 关闭面板时触发事件
const handleClose = () => {
  isDashboardVisible.value = false; // 隐藏显示
};

## 待处理内容
1. 调整api.js中BASE_URL的值为具体url
2. 如果根据项目规范，api.js与components目录的相对位置出现变化，需要修改如下组件中对api的引用：
   1. components\AccuracyDetailModal.vue 第79行
   2. components\DataCorrectionModal.vue 第327行
   3. components\CaseDashboard\DashboardMain.vue 第155行

