"use client";

import {
    approveContractVersion,
    approveDeliverablesList,
    createContractVersion,
    createOrUpdateDeliverablesList,
    fetchContractChatMessages,
    fetchContractDeliverables,
    fetchContractDetail,
    fetchContractVersions,
    fetchContracts,
    postContractChatMessage,
    requestContractStatusChange,
    respondToStatusChangeRequest,
    reviewDeliverable,
    submitDeliverable,
    trackSignedContractDownload,
    trackUnsignedContractDownload,
    updateSignedContractLink,
    updateUnsignedContractLink,
} from "@/lib/api/proposals";
import {
    Contract,
    ContractChatMessage,
    ContractVersion,
    ContractVersionCreate,
    Deliverable,
    DeliverableCreate,
} from "@/types/proposals";
import {
    Check,
    CheckCircle,
    Download,
    FileText,
    History,
    Loader2,
    MessageCircle,
    Plus,
    Send,
    Upload,
    X,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface ContractsWorkspaceProps {
  role: "Brand" | "Creator";
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string) {
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function prettyPrintJson(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isWorkflowComplete(contract: Contract): boolean {
  return !!(
    contract.unsigned_contract_link &&
    contract.unsigned_contract_downloaded_by_creator &&
    contract.signed_contract_link &&
    contract.signed_contract_downloaded_by_brand
  );
}

function getThreadIcon(type: string) {
  switch (type) {
    case "initial_message":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "terms_update":
      return <FileText className="h-4 w-4 text-green-500" />;
    default:
      return <MessageCircle className="h-4 w-4 text-gray-500" />;
  }
}

export function ContractsWorkspace({ role }: ContractsWorkspaceProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [contractDetail, setContractDetail] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [unsignedLinkInput, setUnsignedLinkInput] = useState<string>("");
  const [signedLinkInput, setSignedLinkInput] = useState<string>("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [statusChangeSubmitting, setStatusChangeSubmitting] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("");
  const [contractChatMessages, setContractChatMessages] = useState<ContractChatMessage[]>([]);
  const [chatMessageDraft, setChatMessageDraft] = useState<string>("");
  const [chatSubmitting, setChatSubmitting] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [editingDeliverables, setEditingDeliverables] = useState(false);
  const [deliverableDrafts, setDeliverableDrafts] = useState<DeliverableCreate[]>([]);
  const [submissionUrl, setSubmissionUrl] = useState<Record<string, string>>({});
  const [reviewComment, setReviewComment] = useState<Record<string, string>>({});
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [submittingDeliverable, setSubmittingDeliverable] = useState<string | null>(null);
  const [reviewingDeliverable, setReviewingDeliverable] = useState<string | null>(null);
  const [contractVersions, setContractVersions] = useState<ContractVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ContractVersion | null>(null);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [amendmentFileUrl, setAmendmentFileUrl] = useState("");
  const [amendmentReason, setAmendmentReason] = useState("");
  const [creatingAmendment, setCreatingAmendment] = useState(false);
  const [approvingVersion, setApprovingVersion] = useState<string | null>(null);

  const selectedContract = useMemo(() => {
    if (!selectedContractId) return null;
    if (contractDetail && contractDetail.id === selectedContractId) {
      return contractDetail;
    }
    return contracts.find((item) => item.id === selectedContractId) || null;
  }, [contracts, contractDetail, selectedContractId]);

  useEffect(() => {
    void loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Load chat, deliverables, and versions when a contract is selected
  useEffect(() => {
    if (selectedContractId) {
      void loadContractChat(selectedContractId);
      void loadDeliverables(selectedContractId);
      void loadContractVersions(selectedContractId);
    } else {
      setContractChatMessages([]);
      setDeliverables([]);
      setContractVersions([]);
      setCurrentVersion(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContractId]);

  async function loadContracts() {
    setLoading(true);
    setGlobalError(null);
    try {
      const data = await fetchContracts();
      if (data.length > 0) {
        const nextId =
          selectedContractId &&
          data.some((item) => item.id === selectedContractId)
            ? selectedContractId
            : data[0].id;
        setContracts(data);
        setSelectedContractId(nextId);
        const contract = data.find((item) => item.id === nextId) || null;
        setContractDetail(contract);
        setUnsignedLinkInput("");
        setSignedLinkInput("");
      } else {
        setContracts(data);
        setSelectedContractId(null);
        setContractDetail(null);
        setUnsignedLinkInput("");
        setSignedLinkInput("");
      }
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }

  async function selectContract(contractId: string) {
    setUnsignedLinkInput("");
    setSignedLinkInput("");
    setChatMessageDraft("");
    setSelectedContractId(contractId);
    try {
      const detail = await fetchContractDetail(contractId);
      setContractDetail(detail);
      setContracts((prev) =>
        prev.map((item) => (item.id === detail.id ? detail : item))
      );
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to fetch contract details");
    }
  }

  async function loadContractChat(contractId: string) {
    setChatLoading(true);
    setGlobalError(null);
    try {
      const messages = await fetchContractChatMessages(contractId);
      setContractChatMessages(messages);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to load chat messages");
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSendChatMessage(contractId: string) {
    if (!chatMessageDraft.trim()) {
      return;
    }
    setChatSubmitting(true);
    setGlobalError(null);
    try {
      await postContractChatMessage(contractId, chatMessageDraft.trim());
      setChatMessageDraft("");
      setGlobalSuccess("Message sent");
      await loadContractChat(contractId);
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to send message");
    } finally {
      setChatSubmitting(false);
    }
  }

  useEffect(() => {
    if (contractChatMessages.length > 0) {
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [contractChatMessages]);

  async function loadDeliverables(contractId: string) {
    setDeliverablesLoading(true);
    setGlobalError(null);
    try {
      const data = await fetchContractDeliverables(contractId);
      setDeliverables(data);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to load deliverables");
    } finally {
      setDeliverablesLoading(false);
    }
  }

  function startEditingDeliverables() {
    setDeliverableDrafts(
      deliverables.map((d) => ({
        description: d.description,
        due_date: d.due_date,
      }))
    );
    setEditingDeliverables(true);
  }

  function cancelEditingDeliverables() {
    setEditingDeliverables(false);
    setDeliverableDrafts([]);
  }

  function addDeliverableDraft() {
    setDeliverableDrafts([
      ...deliverableDrafts,
      { description: "", due_date: null },
    ]);
  }

  function removeDeliverableDraft(index: number) {
    setDeliverableDrafts(deliverableDrafts.filter((_, i) => i !== index));
  }

  function updateDeliverableDraft(index: number, field: keyof DeliverableCreate, value: string | null) {
    const updated = [...deliverableDrafts];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverableDrafts(updated);
  }

  async function saveDeliverablesList(contractId: string) {
    if (deliverableDrafts.some((d) => !d.description.trim())) {
      setGlobalError("All deliverables must have a description");
      return;
    }
    setLoading(true);
    setGlobalError(null);
    try {
      const updated = await createOrUpdateDeliverablesList(contractId, deliverableDrafts);
      setDeliverables(updated);
      setEditingDeliverables(false);
      setGlobalSuccess("Deliverables list updated. Both parties must approve.");
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to update deliverables");
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveDeliverablesList(contractId: string, approved: boolean) {
    setLoading(true);
    setGlobalError(null);
    try {
      const updated = await approveDeliverablesList(contractId, approved);
      setDeliverables(updated);
      setGlobalSuccess(approved ? "Deliverables list approved" : "Approval removed");
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to approve deliverables");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDeliverable(contractId: string, deliverableId: string) {
    const url = submissionUrl[deliverableId];
    if (!url || !url.trim()) {
      setGlobalError("Please enter a submission URL");
      return;
    }
    setSubmittingDeliverable(deliverableId);
    setGlobalError(null);
    try {
      const updated = await submitDeliverable(contractId, deliverableId, url.trim());
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? updated : d))
      );
      setSubmissionUrl((prev) => ({ ...prev, [deliverableId]: "" }));
      setGlobalSuccess("Deliverable submitted for review");
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to submit deliverable");
    } finally {
      setSubmittingDeliverable(null);
    }
  }

  async function handleReviewDeliverable(
    contractId: string,
    deliverableId: string,
    approved: boolean
  ) {
    if (!approved && !rejectionReason[deliverableId]?.trim()) {
      setGlobalError("Please provide a rejection reason");
      return;
    }
    setReviewingDeliverable(deliverableId);
    setGlobalError(null);
    try {
      const updated = await reviewDeliverable(
        contractId,
        deliverableId,
        approved,
        reviewComment[deliverableId] || undefined,
        rejectionReason[deliverableId] || undefined
      );
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? updated : d))
      );
      setReviewComment((prev) => ({ ...prev, [deliverableId]: "" }));
      setRejectionReason((prev) => ({ ...prev, [deliverableId]: "" }));
      setGlobalSuccess(approved ? "Deliverable approved" : "Deliverable rejected");
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to review deliverable");
    } finally {
      setReviewingDeliverable(null);
    }
  }

  const isDeliverablesListApproved = deliverables.length > 0 && deliverables.every(
    (d) => d.brand_approval && d.creator_approval
  );

  async function loadContractVersions(contractId: string) {
    setVersionsLoading(true);
    setGlobalError(null);
    try {
      const versions = await fetchContractVersions(contractId);
      setContractVersions(versions);
      const current = versions.find((v) => v.is_current);
      setCurrentVersion(current || null);
    } catch (error: any) {
      // If current version doesn't exist, that's okay (contract not finalized yet)
      if (error?.message?.includes("No current contract version")) {
        setCurrentVersion(null);
        setContractVersions([]);
      } else {
        setGlobalError(error?.message || "Failed to load contract versions");
      }
    } finally {
      setVersionsLoading(false);
    }
  }

  async function handleCreateAmendment(contractId: string) {
    if (!amendmentFileUrl.trim()) {
      setGlobalError("Please enter a file URL");
      return;
    }
    setCreatingAmendment(true);
    setGlobalError(null);
    try {
      const newVersion = await createContractVersion(contractId, {
        file_url: amendmentFileUrl.trim(),
        change_reason: amendmentReason.trim() || null,
      });
      setShowAmendmentModal(false);
      setAmendmentFileUrl("");
      setAmendmentReason("");
      setGlobalSuccess("Amendment created. Both parties must approve.");
      await loadContractVersions(contractId);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to create amendment");
    } finally {
      setCreatingAmendment(false);
    }
  }

  async function handleApproveVersion(contractId: string, versionId: string, approved: boolean) {
    setApprovingVersion(versionId);
    setGlobalError(null);
    try {
      await approveContractVersion(contractId, versionId, approved);
      setGlobalSuccess(approved ? "Version approved" : "Version rejected");
      await loadContractVersions(contractId);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to approve version");
    } finally {
      setApprovingVersion(null);
    }
  }

  async function handleUploadUnsignedLink(contractId: string) {
    if (!unsignedLinkInput.trim()) {
      setGlobalError("Please enter a valid link");
      return;
    }
    setLinkSubmitting(true);
    setGlobalError(null);
    try {
      const updated = await updateUnsignedContractLink(contractId, unsignedLinkInput.trim());
      setGlobalSuccess("Unsigned contract link uploaded successfully");
      setUnsignedLinkInput("");
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      setContractDetail(updated);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to upload link");
    } finally {
      setLinkSubmitting(false);
    }
  }

  async function handleUploadSignedLink(contractId: string) {
    if (!signedLinkInput.trim()) {
      setGlobalError("Please enter a valid link");
      return;
    }
    setLinkSubmitting(true);
    setGlobalError(null);
    try {
      const updated = await updateSignedContractLink(contractId, signedLinkInput.trim());
      setGlobalSuccess("Signed contract link uploaded successfully");
      setSignedLinkInput("");
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      setContractDetail(updated);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to upload link");
    } finally {
      setLinkSubmitting(false);
    }
  }

  async function handleDownloadUnsignedContract(contractId: string, link: string) {
    window.open(link, "_blank");
    try {
      const updated = await trackUnsignedContractDownload(contractId);
      setGlobalSuccess("Download tracked successfully");
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      setContractDetail(updated);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to track download");
    }
  }

  async function handleDownloadSignedContract(contractId: string, link: string) {
    window.open(link, "_blank");
    try {
      const updated = await trackSignedContractDownload(contractId);
      setGlobalSuccess("Download tracked successfully");
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      setContractDetail(updated);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to track download");
    }
  }

  async function handleRequestStatusChange(contractId: string) {
    if (!selectedNewStatus) {
      setGlobalError("Please select a status");
      return;
    }
    setStatusChangeSubmitting(true);
    setGlobalError(null);
    try {
      const updated = await requestContractStatusChange(contractId, selectedNewStatus);
      setGlobalSuccess("Status change request sent. Waiting for approval.");
      setSelectedNewStatus("");
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      setContractDetail(updated);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to request status change");
    } finally {
      setStatusChangeSubmitting(false);
    }
  }

  async function handleRespondToStatusChange(contractId: string, approved: boolean) {
    setStatusChangeSubmitting(true);
    setGlobalError(null);
    try {
      const updated = await respondToStatusChangeRequest(contractId, approved);
      setGlobalSuccess(
        approved
          ? "Status change approved. Contract status updated."
          : "Status change request denied."
      );
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      setContractDetail(updated);
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to respond to status change");
    } finally {
      setStatusChangeSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
        <p className="mt-1 text-gray-600">
          {role === "Brand"
            ? "Manage contracts with creators and track workflow progress."
            : "Manage your contracts with brands and track workflow progress."}
        </p>
      </div>

      {(globalError || globalSuccess) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            globalError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span>{globalError || globalSuccess}</span>
            <button
              onClick={() => {
                setGlobalError(null);
                setGlobalSuccess(null);
              }}
              className="text-xs font-semibold tracking-wide uppercase"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-green-500" />
          <p className="mt-4 text-gray-600">Loading contracts...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-md">
          <FileText className="mx-auto h-14 w-14 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            No contracts yet
          </h3>
          <p className="mt-2 text-gray-600">
            {role === "Creator"
              ? "Once you accept a deal, the contract will appear here."
              : "When a creator finalizes a negotiation, you'll see the contract here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            {contracts.map((contractItem) => (
              <button
                key={contractItem.id}
                onClick={() => selectContract(contractItem.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${selectedContractId === contractItem.id ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-green-300"}`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {contractItem.proposal?.subject || "Contract"}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {role === "Brand"
                    ? contractItem.creator_name || "Unknown Creator"
                    : contractItem.brand_name || "Unknown Brand"}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Updated {formatDate(contractItem.updated_at)}
                </p>
                <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-green-800 uppercase">
                  {contractItem.status.replace(/_/g, " ")}
                </span>
              </button>
            ))}
          </div>
          <div className="lg:col-span-2">
            {selectedContract ? (
              <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedContract.proposal?.subject || "Contract"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Campaign:{" "}
                      {selectedContract.proposal?.campaign_title ||
                        "Unknown Campaign"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>
                      Created {formatDate(selectedContract.created_at)} · Updated{" "}
                      {formatDate(selectedContract.updated_at)}
                    </p>
                    <p className="mt-1 font-semibold text-green-700 uppercase">
                      {selectedContract.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-800">Agreed Terms</h4>
                  <pre className="mt-2 max-h-72 overflow-y-auto text-sm whitespace-pre-wrap text-gray-700">
                    {prettyPrintJson(selectedContract.terms)}
                  </pre>
                </div>

                {/* Contract Workflow Section */}
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-800">Contract Workflow</h4>

                  {/* Workflow Steps */}
                  <div className="space-y-3">
                    {/* Step 1: Brand uploads unsigned contract */}
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedContract.unsigned_contract_link ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {selectedContract.unsigned_contract_link ? <Check className="h-5 w-5" /> : "1"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          Brand uploads unsigned contract
                        </p>
                        {role === "Brand" && (
                          <div className="mt-2">
                            {!selectedContract.unsigned_contract_link ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={unsignedLinkInput}
                                  onChange={(e) => setUnsignedLinkInput(e.target.value)}
                                  placeholder="Paste cloud storage link"
                                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                />
                                <button
                                  onClick={() => handleUploadUnsignedLink(selectedContract.id)}
                                  disabled={linkSubmitting || !unsignedLinkInput.trim()}
                                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                >
                                  {linkSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Link uploaded</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 2: Creator downloads unsigned contract */}
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedContract.unsigned_contract_downloaded_by_creator ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {selectedContract.unsigned_contract_downloaded_by_creator ? <Check className="h-5 w-5" /> : "2"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          Creator downloads unsigned contract
                        </p>
                        {role === "Creator" && selectedContract.unsigned_contract_link && (
                          <div className="mt-2">
                            {!selectedContract.unsigned_contract_downloaded_by_creator ? (
                              <button
                                onClick={() => handleDownloadUnsignedContract(selectedContract.id, selectedContract.unsigned_contract_link!)}
                                className="flex items-center gap-2 rounded-lg border border-green-500 bg-white px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50"
                              >
                                <Download className="h-4 w-4" />
                                Download Contract
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Downloaded</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Creator uploads signed contract */}
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedContract.signed_contract_link ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {selectedContract.signed_contract_link ? <Check className="h-5 w-5" /> : "3"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          Creator uploads signed contract
                        </p>
                        {role === "Creator" && (
                          <div className="mt-2">
                            {!selectedContract.signed_contract_link ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={signedLinkInput}
                                  onChange={(e) => setSignedLinkInput(e.target.value)}
                                  placeholder="Paste cloud storage link"
                                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                />
                                <button
                                  onClick={() => handleUploadSignedLink(selectedContract.id)}
                                  disabled={linkSubmitting || !signedLinkInput.trim()}
                                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                >
                                  {linkSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Link uploaded</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Brand downloads signed contract */}
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedContract.signed_contract_downloaded_by_brand ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {selectedContract.signed_contract_downloaded_by_brand ? <Check className="h-5 w-5" /> : "4"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          Brand downloads signed contract
                        </p>
                        {role === "Brand" && selectedContract.signed_contract_link && (
                          <div className="mt-2">
                            {!selectedContract.signed_contract_downloaded_by_brand ? (
                              <button
                                onClick={() => handleDownloadSignedContract(selectedContract.id, selectedContract.signed_contract_link!)}
                                className="flex items-center gap-2 rounded-lg border border-green-500 bg-white px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50"
                              >
                                <Download className="h-4 w-4" />
                                Download Signed Contract
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Downloaded</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pending Status Change Request */}
                  {selectedContract.pending_status_change && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-800">
                        Status Change Request
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        {selectedContract.pending_status_change.requesting_party} wants to change contract status to{" "}
                        <span className="font-semibold">
                          {formatStatus(selectedContract.pending_status_change.requested_status)}
                        </span>
                      </p>
                      {selectedContract.pending_status_change.requesting_party !== role && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleRespondToStatusChange(selectedContract.id, true)}
                            disabled={statusChangeSubmitting}
                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            {statusChangeSubmitting ? (
                              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </button>
                          <button
                            onClick={() => handleRespondToStatusChange(selectedContract.id, false)}
                            disabled={statusChangeSubmitting}
                            className="flex-1 rounded-lg border border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {statusChangeSubmitting ? (
                              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            ) : (
                              "Deny"
                            )}
                          </button>
                        </div>
                      )}
                      {selectedContract.pending_status_change.requesting_party === role && (
                        <p className="mt-2 text-xs text-blue-600">
                          Waiting for {role === "Brand" ? "Creator" : "Brand"} to respond...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Change Section - Only show if workflow is complete */}
                  {isWorkflowComplete(selectedContract) && !selectedContract.pending_status_change && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-800">
                        Change Contract Status
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        All workflow steps completed. You can now request a status change.
                      </p>
                      <div className="mt-3 space-y-2">
                        <select
                          value={selectedNewStatus}
                          onChange={(e) => setSelectedNewStatus(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <option value="">Select new status...</option>
                          <option value="signed_and_active">Signed and Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed_successfully">Completed Successfully</option>
                          <option value="terminated">Terminated</option>
                        </select>
                        <button
                          onClick={() => handleRequestStatusChange(selectedContract.id)}
                          disabled={statusChangeSubmitting || !selectedNewStatus}
                          className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {statusChangeSubmitting ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          ) : (
                            "Request Status Change"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800">
                    Negotiation History
                  </h4>
                  <div className="mt-3 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {(
                      selectedContract.negotiation_thread ||
                      selectedContract.proposal?.negotiation_thread ||
                      []
                    ).map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getThreadIcon(entry.type)}
                            <span className="text-sm font-semibold text-gray-800">
                              {entry.sender_role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                          {entry.message}
                        </p>
                        {entry.meta?.terms && (
                          <div className="mt-2 rounded border border-blue-100 bg-blue-50 p-2">
                            <p className="text-xs font-semibold text-blue-800">
                              Terms Snapshot
                            </p>
                            <pre className="mt-1 max-h-40 overflow-y-auto text-xs whitespace-pre-wrap text-blue-900">
                              {JSON.stringify(entry.meta.terms, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Deliverables</h4>
                    {role === "Brand" && !editingDeliverables && (
                      <button
                        onClick={startEditingDeliverables}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                      >
                        <Plus className="h-3 w-3" />
                        {deliverables.length === 0 ? "Create List" : "Edit List"}
                      </button>
                    )}
                  </div>

                  {deliverablesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                    </div>
                  ) : editingDeliverables ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-3">
                        {deliverableDrafts.map((draft, index) => (
                          <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-2">
                                <textarea
                                  value={draft.description}
                                  onChange={(e) =>
                                    updateDeliverableDraft(index, "description", e.target.value)
                                  }
                                  placeholder="Deliverable description..."
                                  rows={2}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                />
                                <input
                                  type="datetime-local"
                                  value={
                                    draft.due_date
                                      ? new Date(draft.due_date).toISOString().slice(0, 16)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    updateDeliverableDraft(
                                      index,
                                      "due_date",
                                      e.target.value ? new Date(e.target.value).toISOString() : null
                                    )
                                  }
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                />
                              </div>
                              <button
                                onClick={() => removeDeliverableDraft(index)}
                                className="rounded p-1 text-red-500 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={addDeliverableDraft}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                          Add Deliverable
                        </button>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => saveDeliverablesList(selectedContract.id)}
                          disabled={loading || deliverableDrafts.length === 0}
                          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          ) : (
                            "Save List"
                          )}
                        </button>
                        <button
                          onClick={cancelEditingDeliverables}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : deliverables.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {role === "Brand"
                          ? "No deliverables list created yet. Create one to get started."
                          : "No deliverables list available yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Approval Status */}
                      {!isDeliverablesListApproved && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                          <p className="text-sm font-semibold text-yellow-800">
                            Pending Approval
                          </p>
                          <p className="mt-1 text-xs text-yellow-700">
                            Brand: {deliverables[0]?.brand_approval ? "✓ Approved" : "✗ Pending"} • Creator: {deliverables[0]?.creator_approval ? "✓ Approved" : "✗ Pending"}
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleApproveDeliverablesList(selectedContract.id, true)}
                              disabled={loading}
                              className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                              {loading ? (
                                <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                              ) : (
                                "Approve List"
                              )}
                            </button>
                            {deliverables[0]?.brand_approval && role === "Brand" && (
                              <button
                                onClick={() => handleApproveDeliverablesList(selectedContract.id, false)}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                              >
                                Revoke
                              </button>
                            )}
                            {deliverables[0]?.creator_approval && role === "Creator" && (
                              <button
                                onClick={() => handleApproveDeliverablesList(selectedContract.id, false)}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Deliverables List */}
                      <div className="space-y-3">
                        {deliverables.map((deliverable) => {
                          const isOverdue =
                            deliverable.due_date &&
                            new Date(deliverable.due_date) < new Date() &&
                            deliverable.status !== "completed";
                          return (
                            <div
                              key={deliverable.id}
                              className={`rounded-lg border p-4 ${
                                deliverable.status === "completed"
                                  ? "border-green-200 bg-green-50"
                                  : deliverable.status === "rejected"
                                    ? "border-red-200 bg-red-50"
                                    : deliverable.status === "under_review"
                                      ? "border-blue-200 bg-blue-50"
                                      : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {deliverable.description}
                                    </p>
                                    {deliverable.status === "completed" && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    {deliverable.status === "rejected" && (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  {deliverable.due_date && (
                                    <p
                                      className={`mt-1 text-xs ${
                                        isOverdue ? "font-semibold text-red-600" : "text-gray-500"
                                      }`}
                                    >
                                      Due: {formatDateTime(deliverable.due_date)}
                                      {isOverdue && " (Overdue)"}
                                    </p>
                                  )}
                                  <span
                                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                      deliverable.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : deliverable.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : deliverable.status === "under_review"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {formatStatus(deliverable.status)}
                                  </span>
                                </div>
                              </div>

                              {/* Submission URL Display */}
                              {deliverable.submission_url && (
                                <div className="mt-3 rounded border border-gray-200 bg-white p-2">
                                  <p className="text-xs font-semibold text-gray-700">Submission:</p>
                                  <a
                                    href={deliverable.submission_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 block truncate text-xs text-blue-600 hover:underline"
                                  >
                                    {deliverable.submission_url}
                                  </a>
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {deliverable.rejection_reason && (
                                <div className="mt-3 rounded border border-red-200 bg-red-50 p-2">
                                  <p className="text-xs font-semibold text-red-800">
                                    Rejection Reason:
                                  </p>
                                  <p className="mt-1 text-xs text-red-700">
                                    {deliverable.rejection_reason}
                                  </p>
                                </div>
                              )}

                              {/* Review Comment */}
                              {deliverable.review_comment && (
                                <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-2">
                                  <p className="text-xs font-semibold text-blue-800">
                                    Review Comment:
                                  </p>
                                  <p className="mt-1 text-xs text-blue-700">
                                    {deliverable.review_comment}
                                  </p>
                                </div>
                              )}

                              {/* Creator: Submit/Resubmit */}
                              {role === "Creator" &&
                                isDeliverablesListApproved &&
                                deliverable.status !== "completed" && (
                                  <div className="mt-3 space-y-2">
                                    <input
                                      type="text"
                                      value={submissionUrl[deliverable.id] || ""}
                                      onChange={(e) =>
                                        setSubmissionUrl((prev) => ({
                                          ...prev,
                                          [deliverable.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Paste submission URL (Google Drive, Dropbox, etc.)"
                                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    />
                                    <button
                                      onClick={() =>
                                        handleSubmitDeliverable(
                                          selectedContract.id,
                                          deliverable.id
                                        )
                                      }
                                      disabled={
                                        submittingDeliverable === deliverable.id ||
                                        !submissionUrl[deliverable.id]?.trim()
                                      }
                                      className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                    >
                                      {submittingDeliverable === deliverable.id ? (
                                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                      ) : deliverable.status === "rejected" ? (
                                        "Resubmit"
                                      ) : (
                                        "Submit"
                                      )}
                                    </button>
                                  </div>
                                )}

                              {/* Brand: Review */}
                              {role === "Brand" &&
                                isDeliverablesListApproved &&
                                deliverable.status === "under_review" && (
                                  <div className="mt-3 space-y-2">
                                    <textarea
                                      value={reviewComment[deliverable.id] || ""}
                                      onChange={(e) =>
                                        setReviewComment((prev) => ({
                                          ...prev,
                                          [deliverable.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Optional review comment..."
                                      rows={2}
                                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    />
                                    <textarea
                                      value={rejectionReason[deliverable.id] || ""}
                                      onChange={(e) =>
                                        setRejectionReason((prev) => ({
                                          ...prev,
                                          [deliverable.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Rejection reason (required if rejecting)..."
                                      rows={2}
                                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleReviewDeliverable(
                                            selectedContract.id,
                                            deliverable.id,
                                            true
                                          )
                                        }
                                        disabled={reviewingDeliverable === deliverable.id}
                                        className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                      >
                                        {reviewingDeliverable === deliverable.id ? (
                                          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                        ) : (
                                          "Approve"
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleReviewDeliverable(
                                            selectedContract.id,
                                            deliverable.id,
                                            false
                                          )
                                        }
                                        disabled={
                                          reviewingDeliverable === deliverable.id ||
                                          !rejectionReason[deliverable.id]?.trim()
                                        }
                                        className="flex-1 rounded-lg border border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                      >
                                        {reviewingDeliverable === deliverable.id ? (
                                          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                        ) : (
                                          "Reject"
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contract Versioning Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Contract Versions</h4>
                    {currentVersion && (
                      <button
                        onClick={() => setShowAmendmentModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3" />
                        Create Amendment
                      </button>
                    )}
                  </div>

                  {versionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                    </div>
                  ) : currentVersion ? (
                    <div className="space-y-4">
                      {/* Current Version */}
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <h5 className="font-semibold text-green-900">
                                Current Version (v{currentVersion.version_number})
                              </h5>
                            </div>
                            <p className="mt-1 text-sm text-green-700">
                              {currentVersion.change_reason || "Initial signed contract"}
                            </p>
                            <p className="mt-1 text-xs text-green-600">
                              Uploaded {formatDateTime(currentVersion.uploaded_at)}
                            </p>
                          </div>
                          <a
                            href={currentVersion.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      </div>

                      {/* Version History */}
                      {contractVersions.length > 1 && (
                        <div>
                          <h5 className="mb-2 text-sm font-semibold text-gray-700">
                            Version History
                          </h5>
                          <div className="space-y-2">
                            {contractVersions
                              .filter((v) => !v.is_current)
                              .sort((a, b) => b.version_number - a.version_number)
                              .map((version) => {
                                const isPending = version.status === "pending";
                                const isRejected = version.status === "rejected";
                                const needsApproval =
                                  isPending &&
                                  ((role === "Brand" && !version.brand_approval) ||
                                    (role === "Creator" && !version.creator_approval));

                                return (
                                  <div
                                    key={version.id}
                                    className={`rounded-lg border p-3 ${
                                      isRejected
                                        ? "border-red-200 bg-red-50"
                                        : isPending
                                          ? "border-yellow-200 bg-yellow-50"
                                          : "border-gray-200 bg-white"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <History className="h-4 w-4 text-gray-500" />
                                          <span className="text-sm font-semibold text-gray-900">
                                            Version {version.version_number}
                                          </span>
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                              version.status === "final"
                                                ? "bg-green-100 text-green-800"
                                                : version.status === "rejected"
                                                  ? "bg-red-100 text-red-800"
                                                  : "bg-yellow-100 text-yellow-800"
                                            }`}
                                          >
                                            {formatStatus(version.status)}
                                          </span>
                                        </div>
                                        {version.change_reason && (
                                          <p className="mt-1 text-xs text-gray-600">
                                            {version.change_reason}
                                          </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                          Uploaded {formatDateTime(version.uploaded_at)}
                                        </p>
                                        {isPending && (
                                          <p className="mt-2 text-xs text-gray-600">
                                            Brand: {version.brand_approval ? "✓ Approved" : "✗ Pending"} • Creator: {version.creator_approval ? "✓ Approved" : "✗ Pending"}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <a
                                          href={version.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-50"
                                        >
                                          <Download className="h-3 w-3" />
                                          View
                                        </a>
                                        {needsApproval && (
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() =>
                                                handleApproveVersion(
                                                  selectedContract.id,
                                                  version.id,
                                                  true
                                                )
                                              }
                                              disabled={approvingVersion === version.id}
                                              className="flex-1 rounded border border-green-500 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                                            >
                                              {approvingVersion === version.id ? (
                                                <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                                              ) : (
                                                "Approve"
                                              )}
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleApproveVersion(
                                                  selectedContract.id,
                                                  version.id,
                                                  false
                                                )
                                              }
                                              disabled={approvingVersion === version.id}
                                              className="flex-1 rounded border border-red-500 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                            >
                                              {approvingVersion === version.id ? (
                                                <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                                              ) : (
                                                "Reject"
                                              )}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        No contract version available yet. The contract will be versioned once both parties have signed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Amendment Modal */}
                {showAmendmentModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
                      <button
                        onClick={() => {
                          setShowAmendmentModal(false);
                          setAmendmentFileUrl("");
                          setAmendmentReason("");
                        }}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <h3 className="text-xl font-bold text-gray-900">
                        Create Contract Amendment
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        Upload a new version of the contract. Both parties must approve before it becomes the current version.
                      </p>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Contract File URL
                          </label>
                          <input
                            type="text"
                            value={amendmentFileUrl}
                            onChange={(e) => setAmendmentFileUrl(e.target.value)}
                            placeholder="Paste cloud storage link (Google Drive, Dropbox, etc.)"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Change Reason (Optional)
                          </label>
                          <textarea
                            value={amendmentReason}
                            onChange={(e) => setAmendmentReason(e.target.value)}
                            placeholder="Explain the reason for this amendment..."
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => handleCreateAmendment(selectedContract.id)}
                          disabled={creatingAmendment || !amendmentFileUrl.trim()}
                          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {creatingAmendment ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          ) : (
                            "Create Amendment"
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowAmendmentModal(false);
                            setAmendmentFileUrl("");
                            setAmendmentReason("");
                          }}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contract Chat Section */}
                <div>
                  <h4 className="font-semibold text-gray-800">Contract Chat</h4>
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50">
                    {/* Chat Messages */}
                    <div className="max-h-96 space-y-3 overflow-y-auto p-4">
                      {chatLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                        </div>
                      ) : contractChatMessages.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-500">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        contractChatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-lg bg-white p-3 shadow-sm ${
                              msg.sender_role === role
                                ? "ml-auto max-w-[80%] bg-green-50"
                                : "mr-auto max-w-[80%]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-800">
                                  {msg.sender_role}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(msg.created_at)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                              {msg.message}
                            </p>
                          </div>
                        ))
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-gray-200 bg-white p-4">
                      <div className="flex gap-2">
                        <textarea
                          value={chatMessageDraft}
                          onChange={(e) => setChatMessageDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (chatMessageDraft.trim() && !chatSubmitting) {
                                handleSendChatMessage(selectedContract.id);
                              }
                            }
                          }}
                          placeholder="Type your message..."
                          rows={2}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                          disabled={chatSubmitting}
                        />
                        <button
                          onClick={() => handleSendChatMessage(selectedContract.id)}
                          disabled={chatSubmitting || !chatMessageDraft.trim()}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {chatSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-gray-600">
                  Select a contract to view its details and history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

