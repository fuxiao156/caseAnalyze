import axios from 'axios';

const BASE_URL = 'http://10.100.5.251:16663';

/**
 * 启动分析任务
 * @param {Object} params { content: string }
 * @returns {Promise}
 */
export const analyzeCase = (params) => {
  return axios({
    method: 'post',
    url: `${BASE_URL}/api/analyze`,
    data: params,
  }).then(res => res.data);
};

/**
 * 查询任务进度
 * @param {string} taskId 任务ID
 * @returns {Promise}
 */
export const queryTaskProgress = (taskId) => {
  return axios({
    method: 'get',
    url: `${BASE_URL}/api/query/${taskId}`,
  }).then(res => res.data);
};
