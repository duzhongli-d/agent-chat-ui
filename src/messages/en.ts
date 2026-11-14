import type { ICUArgs, ICUTags } from "use-intl/core";

/**
 * The English catalog — the source of truth for the message *shape*.
 *
 * Every other locale is checked against `Messages` (the widened form of this
 * object) with `satisfies`, so a missing or extra key is a compile error.
 *
 * ICU MessageFormat rules that apply here:
 * - `{name}` interpolates a **string**; `{count, number}` interpolates a number.
 * - `<tag>...</tag>` is a rich-text element and MUST be read with `t.rich()`.
 * - `{count, plural, ...}` needs `one` + `other` in English; Chinese only needs `other`.
 */
export const en = {
  app: {
    title: "Agent Chat",
    description: "Agent Chat UX by LangChain",
    loading: "Loading (layout)...",
  },
  setup: {
    welcome:
      "Welcome to Agent Chat! Before you get started, you need to enter the URL of the deployment and the assistant / graph ID.",
    deploymentUrl: "Deployment URL",
    deploymentUrlHelp:
      "This is the URL of your LangGraph deployment. Can be a local, or production deployment.",
    assistantId: "Assistant / Graph ID",
    assistantIdHelp:
      "This is the ID of the graph (can be the graph name), or assistant to fetch threads from, and invoke when actions are taken.",
    apiKey: "LangSmith API Key",
    apiKeyHelp:
      "This is <not>NOT</not> required if using a local LangGraph server. This value is stored in your browser's local storage and is only used to authenticate requests sent to your LangGraph server.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    agentBuilder: "Built with Agent Builder",
    agentBuilderHelp: "Enable this for Agent Builder deployments.",
    continue: "Continue",
    connectError: "Failed to connect to LangGraph server",
    connectErrorHelp:
      "Please ensure your graph is running at {url} and your API key is correctly set (if connecting to a deployed graph).",
  },
  language: {
    label: "Switch language",
    tooltip: "Language / 语言",
  },
  chat: {
    newThread: "New thread",
    scrollToBottom: "Scroll to bottom",
    openGitHubRepo: "Open GitHub repo",
    connectedTo: "Connected to {url}",
    placeholder: "Type your message...",
    send: "Send",
    cancel: "Cancel",
    hideToolCalls: "Hide Tool Calls",
    uploadFile: "Upload PDF or Image",
    error: "An error occurred. Please try again.",
    errorLabel: "Error:",
  },
  history: {
    threadHistory: "Thread History",
    close: "Close",
  },
  messages: {
    copyContent: "Copy content",
    copy: "Copy",
    cancelEdit: "Cancel edit",
    submit: "Submit",
    refresh: "Refresh",
    edit: "Edit",
    toolResult: "Tool Result",
    toolResultLabel: "Tool Result:",
    truncated: "Truncated {count, number} characters...",
    humanInterrupt: "Human Interrupt",
  },
  inbox: {
    state: "State",
    description: "Description",
    studio: "Studio",
    markAsResolved: "Mark as Resolved",
    approveAll: "Approve All",
    previous: "Previous",
    next: "Next",
    submitting: "Submitting...",
    submittingDecision: "Submitting decision...",
    submitAll:
      "{count, plural, one {Submit all # decision} other {Submit all # decisions}}",
    actionIndex: "Action {index, number}",
    actionCaptured: "Action {index, number} captured.",
    actionsCount: "{title} ({current, number}/{total, number})",
    addressAllActions:
      "{count, plural, one {Please address all # action before submitting.} other {Please address all # actions before submitting.}}",
    reason: "Reason",
    rejectPlaceholder: "Share feedback with the agent...",
    submitRejection: "Submit rejection",
    reset: "Reset",
    editApprove: "Edit/Approve",
    edit: "Edit",
    submit: "Submit",
    or: "Or",
    currentlySelected: "Currently selected: {value}",
    copyThreadId: "Copy thread ID",
    threadIdLabel: "ID",
    interruptIndex: "Interrupt {index, number}",
    unknownInterrupt: "Unknown interrupt",
    invalidFormat:
      "Unable to render interrupt. The data provided is not in the expected HITL format.",
    noReviewConfig:
      "No review configuration was provided for <strong>{actionName}</strong>, so this action cannot be approved, edited, or rejected. Mark the thread as resolved to dismiss it.",
    updateValuesFailed: "Unable to update edited values.",
    finished: "Successfully finished Graph invocation.",
    success: "Success",
    error: "Error",
  },
  decisions: {
    approve: "Approve",
    edit: "Edit",
    reject: "Reject",
  },
  state: {
    user: "User",
    assistant: "Assistant",
    tool: "Tool",
    system: "System",
    noState: "No state found",
    noDescription: "No description provided",
  },
  fileUpload: {
    invalidType:
      "You have uploaded invalid file type. Please upload a JPEG, PNG, GIF, WEBP image or a PDF.",
    pastedInvalidType:
      "You have pasted an invalid file type. Please paste a JPEG, PNG, GIF, WEBP image or a PDF.",
    duplicate:
      "Duplicate file(s) detected: {files}. Each file can only be uploaded once per message.",
    unsupportedType: "Unsupported file type",
    uploadedImage: "uploaded image",
    pdfFile: "PDF file",
    removeImage: "Remove image",
    removePdf: "Remove PDF",
    removeFile: "Remove file",
  },
  errors: {
    noResponse: "Please enter a response.",
    emptyResponse: "No response selected.",
    unknownType: "Unsupported response type.",
    missingEdit: "Please provide a rejection reason.",
    invalidAssistant: "Error: Invalid assistant ID",
    invalidAssistantHelp:
      "The provided assistant ID was not found in this graph. Please update the assistant ID in the settings and try again.",
    submitFailed: "Failed to submit response.",
    resolveFailed: "Failed to mark thread as resolved.",
    resolveSuccess: "Marked thread as resolved.",
    submitSuccess: "Response submitted successfully.",
    approveAllFailed: "Failed to approve all actions.",
    approveAllSuccess: "All actions approved successfully.",
    submitAllFailed: "Failed to submit actions.",
    submitAllSuccess: "All actions submitted successfully.",
    unknownDecision: "Unable to determine decision.",
    missingApiUrl: "Please set the LangGraph deployment URL in settings.",
  },
} as const;

/**
 * The catalog shape with every leaf widened to `string`.
 *
 * `zh-CN.ts` uses this as its `satisfies` target, so the compiler enforces that both
 * catalogs have exactly the same keys. The *values* are widened because the Chinese
 * strings differ from the English ones; the *keys* stay literal, which is what makes
 * `useTranslations("chat")` -> `t("send")` type-safe.
 */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;

/* -------------------------------------------------------------------------- */
/* Compile-time ICU parity                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The argument types next-intl itself uses when it parses a message.
 *
 * Mirroring them here means the parity check compares exactly what the runtime
 * will compare — a `{count, number}` placeholder resolves to `number | bigint`,
 * a bare `{url}` resolves to `string`.
 */
type IcuOptions = {
  ICUArgument: string;
  ICUNumberArgument: number | bigint;
  ICUDateArgument: Date;
};

/** The placeholders a message declares, with the type each one expects. */
type ArgsOf<M extends string> = ICUArgs<M, IcuOptions>;

/** The rich-text tags a message declares. */
type TagsOf<M extends string> = ICUTags<M, unknown>;

/**
 * `true` when two messages declare the same placeholders (same names, same value
 * types) and the same rich-text tags.
 *
 * Both directions are checked: a translation that drops a placeholder and one that
 * invents an extra one are both mismatches.
 */
type SameStructure<TZh, TEn> = TZh extends string
  ? TEn extends string
    ? [ArgsOf<TZh>] extends [ArgsOf<TEn>]
      ? [ArgsOf<TEn>] extends [ArgsOf<TZh>]
        ? [TagsOf<TZh>] extends [TagsOf<TEn>]
          ? [TagsOf<TEn>] extends [TagsOf<TZh>]
            ? true
            : false
          : false
        : false
      : false
    : false
  : false;

/**
 * The dot-separated paths of every message whose ICU structure differs between
 * the two catalogs. `never` when they match.
 */
type Mismatches<TZh, TEn> = {
  [K in Extract<keyof TEn, string>]: K extends keyof TZh
    ? TEn[K] extends string
      ? TZh[K] extends string
        ? SameStructure<TZh[K], TEn[K]> extends true
          ? never
          : K
        : K
      : TZh[K] extends object
        ? Mismatches<TZh[K], TEn[K]> extends never
          ? never
          : `${K}.${Mismatches<TZh[K], TEn[K]>}`
        : K
    : K;
}[Extract<keyof TEn, string>];

/**
 * `true` when the two catalogs declare the same ICU structure, otherwise an object
 * naming the offending messages — which turns the failure into a readable error.
 */
export type IcuParity<TZh, TEn> = [Mismatches<TZh, TEn>] extends [never]
  ? true
  : { "ICU structure mismatch in": Mismatches<TZh, TEn> };

/**
 * A compile-time assertion helper.
 *
 * `Assert<T extends true>` fails to compile when `T` is not `true`, so it can
 * turn any type-level check into a build error.
 */
export type Assert<T extends true> = T;
