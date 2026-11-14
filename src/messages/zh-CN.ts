import type { Assert, IcuParity, Messages } from "./en";
import { en } from "./en";

/**
 * The Simplified Chinese catalog.
 *
 * `satisfies Messages` makes the compiler enforce that this file has exactly the
 * same keys as `en.ts` — a missing or extra key is a build error.
 *
 * `as const` is required: the ICU parity check below parses the *literal* text of
 * every message, so the string types must not widen to `string`.
 *
 * Typography rules applied here:
 * - No space between Chinese and an embedded numeral (`已处理第3个操作。`).
 * - Full-width punctuation: `，。：；！？（）`.
 * - Product names stay in Latin script: `LangGraph`, `LangSmith API Key`,
 *   `Agent Builder`, `PDF`, `graph`.
 * - Sentence-form strings end with `。`; button labels do not.
 *
 * The ICU *structure* must match `en.ts` exactly (same placeholders, same tag
 * names) — only the wording differs. That is enforced by `IcuParity` below, not
 * just documented.
 */
export const zhCN = {
  app: {
    title: "Agent Chat",
    description: "LangChain 出品的 Agent Chat 界面",
    loading: "正在加载（布局）…",
  },
  setup: {
    welcome:
      "欢迎使用 Agent Chat！开始之前，请填写部署地址以及 assistant / graph 的 ID。",
    deploymentUrl: "部署地址",
    deploymentUrlHelp:
      "这是你的 LangGraph 部署地址，可以是本地部署，也可以是生产环境。",
    assistantId: "Assistant / Graph ID",
    assistantIdHelp:
      "这是 graph 的 ID（也可以是 graph 名称），用于获取会话记录并在触发操作时调用。",
    apiKey: "LangSmith API Key",
    apiKeyHelp:
      "使用本地 LangGraph 服务器时<not>不需要</not>填写此项。该值仅保存在浏览器的 local storage 中，只用于向你的 LangGraph 服务器发送认证请求。",
    agentBuilder: "由 Agent Builder 构建",
    agentBuilderHelp: "为 Agent Builder 部署启用此选项。",
    continue: "继续",
    connectError: "无法连接到 LangGraph 服务器",
    connectErrorHelp:
      "请确认你的 graph 正在 {url} 运行，并已正确设置 API key（连接已部署的 graph 时需要）。",
  },
  language: {
    label: "切换语言",
    tooltip: "Language / 语言",
  },
  chat: {
    newThread: "新建会话",
    scrollToBottom: "滚动到底部",
    openGitHubRepo: "打开 GitHub 仓库",
    connectedTo: "已连接到 {url}",
    placeholder: "输入你的消息…",
    send: "发送",
    cancel: "取消",
    hideToolCalls: "隐藏工具调用",
    uploadFile: "上传 PDF 或图片",
    error: "发生错误，请重试。",
    errorLabel: "错误：",
  },
  history: {
    threadHistory: "会话历史",
    close: "关闭",
  },
  messages: {
    copyContent: "复制内容",
    copy: "复制",
    cancelEdit: "取消编辑",
    submit: "提交",
    refresh: "刷新",
    edit: "编辑",
    toolResult: "工具结果",
    toolResultLabel: "工具结果：",
    truncated: "已截断{count, number}个字符…",
    humanInterrupt: "人工中断",
  },
  inbox: {
    state: "状态",
    description: "描述",
    studio: "Studio",
    markAsResolved: "标记为已解决",
    approveAll: "全部批准",
    previous: "上一个",
    next: "下一个",
    submitting: "提交中…",
    submittingDecision: "正在提交决策…",
    submitAll: "{count, plural, other {提交全部 # 条决策}}",
    actionIndex: "操作{index, number}",
    actionCaptured: "已捕获操作{index, number}。",
    actionsCount: "{title}（{current, number}/{total, number}）",
    addressAllActions: "{count, plural, other {请先处理全部 # 个操作再提交。}}",
    reason: "原因",
    rejectPlaceholder: "向 agent 分享反馈…",
    submitRejection: "提交拒绝",
    reset: "重置",
    editApprove: "编辑/批准",
    edit: "编辑",
    submit: "提交",
    or: "或",
    currentlySelected: "当前选择：{value}",
    copyThreadId: "复制 thread ID",
    threadIdLabel: "ID",
    interruptIndex: "中断{index, number}",
    unknownInterrupt: "未知中断",
    invalidFormat: "无法渲染中断。提供的数据不符合预期的 HITL 格式。",
    noReviewConfig:
      "未提供<strong>{actionName}</strong>的审核配置，因此该操作无法批准、编辑或拒绝。请将线程标记为已解决以关闭它。",
    updateValuesFailed: "无法更新编辑后的值。",
    finished: "已成功完成 Graph 调用。",
    success: "成功",
    error: "错误",
  },
  decisions: {
    approve: "批准",
    edit: "编辑",
    reject: "拒绝",
  },
  state: {
    user: "用户",
    assistant: "助手",
    tool: "工具",
    system: "系统",
    noState: "未找到状态",
    noDescription: "未提供描述",
  },
  fileUpload: {
    invalidType: "上传的文件类型无效。请上传 JPEG、PNG、GIF、WEBP 图片或 PDF。",
    pastedInvalidType:
      "粘贴的文件类型无效。请粘贴 JPEG、PNG、GIF、WEBP 图片或 PDF。",
    duplicate: "检测到重复文件：{files}。每个文件在一条消息中只能上传一次。",
    unsupportedType: "不支持的文件类型",
    uploadedImage: "已上传的图片",
    pdfFile: "PDF 文件",
    removeImage: "移除图片",
    removePdf: "移除 PDF",
    removeFile: "移除文件",
  },
  errors: {
    noResponse: "请填写响应。",
    emptyResponse: "未选择响应。",
    unknownType: "不支持的响应类型。",
    missingEdit: "请填写拒绝原因。",
    invalidAssistant: "错误：assistant ID 无效",
    invalidAssistantHelp:
      "在此 graph 中未找到提供的 assistant ID。请在设置中更新 assistant ID 后重试。",
    submitFailed: "提交响应失败。",
    resolveFailed: "将线程标记为已解决失败。",
    resolveSuccess: "已将线程标记为已解决。",
    submitSuccess: "响应提交成功。",
    approveAllFailed: "批准全部操作失败。",
    approveAllSuccess: "已成功批准全部操作。",
    submitAllFailed: "提交操作失败。",
    submitAllSuccess: "已成功提交全部操作。",
    unknownDecision: "无法确定决策。",
    missingApiUrl: "请在设置中填写 LangGraph 部署地址。",
  },
} as const satisfies Messages;

/**
 * Compile-time proof that every Chinese message declares the same ICU structure
 * as its English original — the same placeholders (same names, same value types)
 * and the same rich-text tags.
 *
 * If a translation drops `{url}` or renames the `<not>` tag, this alias fails to
 * compile and the error names the offending message.
 */
export type ZhCnuParity = Assert<IcuParity<typeof zhCN, typeof en>>;
