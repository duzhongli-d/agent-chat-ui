import { useCallback, useEffect, useMemo, useState } from "react";
import { Interrupt } from "@langchain/langgraph-sdk";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ThreadIdCopyable } from "./thread-id";
import { InboxItemInput } from "./inbox-item-input";
import useInterruptedActions from "../hooks/use-interrupted-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { constructOpenInStudioURL, buildDecisionFromState } from "../utils";
import { Decision, HITLRequest, DecisionType, ActionRequest } from "../types";
import { useStreamContext } from "@/providers/Stream";

interface ThreadActionsViewProps {
  interrupt: Interrupt<HITLRequest>;
  handleShowSidePanel: (showState: boolean, showDescription: boolean) => void;
  showState: boolean;
  showDescription: boolean;
}

function ButtonGroup({
  handleShowState,
  handleShowDescription,
  showingState,
  showingDescription,
}: {
  handleShowState: () => void;
  handleShowDescription: () => void;
  showingState: boolean;
  showingDescription: boolean;
}) {
  const t = useTranslations("inbox");

  return (
    <div className="flex flex-row items-center justify-center gap-0">
      <Button
        variant="outline"
        className={cn(
          "rounded-l-md rounded-r-none border-r-[0px]",
          showingState ? "text-black" : "bg-white",
        )}
        size="sm"
        onClick={handleShowState}
      >
        {t("state")}
      </Button>
      <Button
        variant="outline"
        className={cn(
          "rounded-l-none rounded-r-md border-l-[0px]",
          showingDescription ? "text-black" : "bg-white",
        )}
        size="sm"
        onClick={handleShowDescription}
      >
        {t("description")}
      </Button>
    </div>
  );
}

function isValidHitlRequest(
  interrupt: Interrupt<HITLRequest>,
): interrupt is Interrupt<HITLRequest> & { value: HITLRequest } {
  return (
    !!interrupt.value &&
    Array.isArray(interrupt.value.action_requests) &&
    interrupt.value.action_requests.length > 0 &&
    Array.isArray(interrupt.value.review_configs) &&
    interrupt.value.review_configs.length > 0
  );
}

function getDecisionStatus(
  decision: Decision | undefined,
): DecisionType | null {
  if (!decision) return null;
  return decision.type;
}

/**
 * The action's name, as supplied by the server.
 *
 * The name stays in the server's own vocabulary — only the fallback, which the
 * app owns, is translated.
 */
function getActionTitle(action: ActionRequest | undefined, fallback: string) {
  return action?.name ?? fallback;
}

export function ThreadActionsView({
  interrupt,
  handleShowSidePanel,
  showDescription,
  showState,
}: ThreadActionsViewProps) {
  const t = useTranslations("inbox");
  const tErrors = useTranslations("errors");
  const stream = useStreamContext();
  const [threadId] = useQueryState("threadId");
  const [apiUrl] = useQueryState("apiUrl");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addressedActions, setAddressedActions] = useState<
    Map<number, Decision>
  >(new Map());
  const [submittingAll, setSubmittingAll] = useState(false);

  const hitlValue = interrupt.value;
  const actionRequests = useMemo(
    () => hitlValue?.action_requests ?? [],
    [hitlValue?.action_requests],
  );
  const reviewConfigs = useMemo(
    () => hitlValue?.review_configs ?? [],
    [hitlValue?.review_configs],
  );

  const hasMultipleActions = actionRequests.length > 1;
  const currentAction = actionRequests[currentIndex];
  const matchingConfig = reviewConfigs.find(
    (config) => config.action_name === currentAction?.name,
  );

  const singleActionInterrupt = useMemo(() => {
    if (!currentAction) {
      return interrupt;
    }

    return {
      ...interrupt,
      value: {
        action_requests: [currentAction],
        // An unmatched action gets no review config, so no decisions are
        // permitted for it.
        review_configs: matchingConfig ? [matchingConfig] : [],
      },
    };
  }, [interrupt, currentAction, matchingConfig]);

  const {
    approveAllowed,
    hasEdited,
    hasAddedResponse,
    streaming,
    supportsMultipleMethods,
    streamFinished,
    loading,
    handleSubmit,
    handleResolve,
    setSelectedSubmitType,
    setHasAddedResponse,
    setHasEdited,
    humanResponse,
    setHumanResponse,
    selectedSubmitType,
    initialHumanInterruptEditValue,
  } = useInterruptedActions({
    interrupt: singleActionInterrupt,
  });

  useEffect(() => {
    setCurrentIndex(0);
    setAddressedActions(new Map());
  }, [interrupt]);

  const handleOpenInStudio = () => {
    if (!apiUrl) {
      toast.error(t("error"), {
        description: tErrors("missingApiUrl"),
        duration: 5000,
        richColors: true,
        closeButton: true,
      });
      return;
    }

    const studioUrl = constructOpenInStudioURL(apiUrl, threadId ?? undefined);
    window.open(studioUrl, "_blank");
  };

  const handleApproveAll = useCallback(() => {
    if (!hasMultipleActions) return;

    try {
      const allDecisions: Decision[] = actionRequests.map(() => ({
        type: "approve",
      }));

      stream.submit(
        {},
        {
          command: {
            resume: { decisions: allDecisions },
          },
        },
      );

      toast(t("success"), {
        description: tErrors("approveAllSuccess"),
        duration: 5000,
      });
    } catch (error) {
      console.error("Error approving all actions", error);
      toast.error(t("error"), {
        description: tErrors("approveAllFailed"),
        richColors: true,
        closeButton: true,
        duration: 5000,
      });
    }
  }, [actionRequests, hasMultipleActions, stream, t, tErrors]);

  const handleSubmitAll = useCallback(() => {
    if (!hasMultipleActions) return;

    if (addressedActions.size !== actionRequests.length) {
      toast.error(t("error"), {
        description: t("addressAllActions", { count: actionRequests.length }),
        richColors: true,
        closeButton: true,
        duration: 5000,
      });
      return;
    }

    try {
      setSubmittingAll(true);
      const allDecisions = actionRequests.map((_, index) => {
        const decision = addressedActions.get(index);
        if (!decision) {
          throw new Error(`Missing decision for action ${index + 1}`);
        }
        return decision;
      });

      stream.submit(
        {},
        {
          command: {
            resume: { decisions: allDecisions },
          },
        },
      );

      toast(t("success"), {
        description: tErrors("submitAllSuccess"),
        duration: 5000,
      });
      setAddressedActions(new Map());
    } catch (error) {
      console.error("Error submitting all actions", error);
      toast.error(t("error"), {
        description: tErrors("submitAllFailed"),
        richColors: true,
        closeButton: true,
        duration: 5000,
      });
    } finally {
      setSubmittingAll(false);
    }
  }, [
    actionRequests,
    addressedActions,
    hasMultipleActions,
    stream,
    t,
    tErrors,
  ]);

  const allAllowApprove = useMemo(() => {
    if (!hasMultipleActions) return false;
    return actionRequests.every((actionRequest) => {
      const matching = reviewConfigs.find(
        (config) => config.action_name === actionRequest.name,
      );
      return matching?.allowed_decisions.includes("approve");
    });
  }, [actionRequests, reviewConfigs, hasMultipleActions]);

  const handleSaveDecision = () => {
    const { decision, errorCode } = buildDecisionFromState(
      humanResponse,
      selectedSubmitType,
    );

    if (!decision || errorCode) {
      toast.error(t("error"), {
        description: errorCode
          ? tErrors(errorCode)
          : tErrors("unknownDecision"),
        richColors: true,
        closeButton: true,
        duration: 5000,
      });
      return;
    }

    setAddressedActions((prev) => {
      const next = new Map(prev);
      next.set(currentIndex, decision);
      return next;
    });

    toast(t("success"), {
      description: t("actionCaptured", { index: currentIndex + 1 }),
      duration: 3000,
    });

    if (currentIndex < actionRequests.length - 1) {
      setCurrentIndex((prev) => Math.min(actionRequests.length - 1, prev + 1));
    }
  };

  const currentTitle = getActionTitle(currentAction, t("unknownInterrupt"));
  const actionsDisabled = loading || streaming || submittingAll;
  const hasAllDecisions =
    hasMultipleActions && addressedActions.size === actionRequests.length;

  if (!isValidHitlRequest(interrupt)) {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center rounded-2xl bg-gray-50/50 p-8">
        <p className="text-sm text-gray-600">{t("invalidFormat")}</p>
      </div>
    );
  }
  const interruptValue = singleActionInterrupt.value as HITLRequest;

  return (
    <div className="flex min-h-full w-full max-w-full flex-col gap-9">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex items-center justify-start gap-3">
          <p className="text-2xl tracking-tighter text-pretty">
            {hasMultipleActions
              ? t("actionsCount", {
                  title: currentTitle,
                  current: currentIndex + 1,
                  total: actionRequests.length,
                })
              : currentTitle}
          </p>
          {threadId && <ThreadIdCopyable threadId={threadId} />}
        </div>
        <div className="flex flex-row items-center justify-start gap-2">
          {apiUrl && (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 bg-white"
              onClick={handleOpenInStudio}
            >
              {t("studio")}
            </Button>
          )}
          <ButtonGroup
            handleShowState={() => handleShowSidePanel(true, false)}
            handleShowDescription={() => handleShowSidePanel(false, true)}
            showingState={showState}
            showingDescription={showDescription}
          />
        </div>
      </div>

      <div className="flex w-full flex-row flex-wrap items-center justify-start gap-2">
        <Button
          variant="outline"
          className="border-gray-500 bg-white font-normal text-gray-800"
          onClick={handleResolve}
          disabled={actionsDisabled}
        >
          {t("markAsResolved")}
        </Button>
        {hasMultipleActions && allAllowApprove && (
          <Button
            variant="outline"
            className="border-gray-500 bg-white font-normal text-gray-800"
            onClick={handleApproveAll}
            disabled={actionsDisabled}
          >
            {t("approveAll")}
          </Button>
        )}
      </div>

      {hasMultipleActions && (
        <div className="flex w-full items-center gap-2">
          {actionRequests.map((_, index) => {
            const status = getDecisionStatus(addressedActions.get(index));
            return (
              <button
                type="button"
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 flex-1 rounded-full border transition-colors",
                  "border-gray-300 bg-gray-200",
                  status === "approve" && "border-emerald-500 bg-emerald-200",
                  status === "reject" && "border-red-500 bg-red-200",
                  status === "edit" && "border-amber-500 bg-amber-200",
                  index === currentIndex &&
                    "outline-primary outline-2 outline-offset-2",
                )}
              >
                <span className="sr-only">
                  {t("actionIndex", { index: index + 1 })}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {matchingConfig ? (
        <InboxItemInput
          approveAllowed={approveAllowed}
          hasEdited={hasEdited}
          hasAddedResponse={hasAddedResponse}
          interruptValue={interruptValue}
          humanResponse={humanResponse}
          initialValues={initialHumanInterruptEditValue.current}
          setHumanResponse={setHumanResponse}
          supportsMultipleMethods={supportsMultipleMethods}
          setSelectedSubmitType={setSelectedSubmitType}
          setHasAddedResponse={setHasAddedResponse}
          setHasEdited={setHasEdited}
          handleSubmit={hasMultipleActions ? handleSaveDecision : handleSubmit}
          isLoading={hasMultipleActions ? submittingAll : loading}
          selectedSubmitType={selectedSubmitType}
        />
      ) : (
        <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-gray-50/50 p-8">
          {/* Fail closed: an action with no matching review config gets no
              decision buttons at all. Only this message and "Mark as Resolved"
              are offered. `<strong>` is the rich-text tag; `{actionName}` is a
              plain placeholder, so the two take different kinds of value. */}
          <p className="text-sm text-gray-600">
            {t.rich("noReviewConfig", {
              strong: (chunks) => <strong>{chunks}</strong>,
              actionName: getActionTitle(currentAction, t("unknownInterrupt")),
            })}
          </p>
        </div>
      )}

      {hasMultipleActions && (
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === actionRequests.length - 1}
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(actionRequests.length - 1, prev + 1),
                )
              }
            >
              {t("next")}
            </Button>
          </div>
          <Button
            variant="brand"
            disabled={!hasAllDecisions || submittingAll}
            onClick={handleSubmitAll}
          >
            {submittingAll
              ? t("submitting")
              : t("submitAll", { count: actionRequests.length })}
          </Button>
        </div>
      )}

      {!hasMultipleActions && streamFinished && (
        <p className="text-base font-medium text-green-600">{t("finished")}</p>
      )}
    </div>
  );
}
