import { getAllRules, dict } from "@/api";

// 定义所有获取函数
export const fetchFunctions = {
  // 所有 rule
  rules: async () => {
    return await getAllRules({
      bizGroup: "create_rule",
    });
  },

  // 字典: 人员分配类型
  personFilterTypes: async () => {
    return await dict({ index: "0" });
  },

  // dict: distribution method
  distributionMethods: async () => {
    return await dict({ index: "1" });
  },
};

// 导出类型
export type FetchFunctions = typeof fetchFunctions;
