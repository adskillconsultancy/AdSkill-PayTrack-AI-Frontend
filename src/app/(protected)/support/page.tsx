"use client";

import * as React from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Inbox,
  Info,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetSupportOverviewQuery,
  useGetSupportConversationsQuery,
  useGetSupportTicketByIdQuery,
  useSendTicketMessageMutation,
  useMarkTicketReadMutation,
  useCreateSupportTicketMutation,
  ConversationChannel,
} from "@/services/api/support/supportApi";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Please provide an update on my case filing timeline.",
  "I have uploaded a bank wire deposit proof for verification.",
  "Could you review my submitted identity and education certificates?",
  "I would like to schedule a 30-minute consultation call.",
];

export default function SupportPage() {
  const { user } = useAuth();
  const { isClientAccount, role } = usePermissions();

  // Queries
  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = useGetSupportConversationsQuery(undefined, {
    pollingInterval: 8000,
  });

  const { data: supportOverviewData } = useGetSupportOverviewQuery();

  // State
  const channels = conversationsData?.data?.activeChannels || [];
  const [selectedChannelId, setSelectedChannelId] = React.useState<string | null>(null);
  const [channelFilter, setChannelFilter] = React.useState<"ALL" | "CONSULTANT" | "MANAGEMENT">("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [messageText, setMessageText] = React.useState("");
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = React.useState(false);
  const [showFaqModal, setShowFaqModal] = React.useState(false);
  const [openFaqId, setOpenFaqId] = React.useState<string | null>("faq-1");

  // New Ticket Modal Form State
  const [newTargetType, setNewTargetType] = React.useState<"CONSULTANT" | "MANAGEMENT_ADMIN">("CONSULTANT");
  const [newCategory, setNewCategory] = React.useState<any>("CASE_STATUS");
  const [newSubject, setNewSubject] = React.useState("");
  const [newInitialMessage, setNewInitialMessage] = React.useState("");
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>("");

  // Mutations
  const [sendMessage, { isLoading: isSendingMessage }] = useSendTicketMessageMutation();
  const [markAsRead] = useMarkTicketReadMutation();
  const [createTicket, { isLoading: isCreatingTicket }] = useCreateSupportTicketMutation();

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Set default selected channel once channels load
  React.useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  // Active channel details
  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0] || null;
  const isDirectPlaceholder = activeChannel?.id?.includes("-direct");

  // Fetch full messages for active ticket if valid UUID
  const shouldFetchTicket = Boolean(activeChannel?.id && !isDirectPlaceholder);
  const {
    data: ticketDetailsData,
    isLoading: isTicketLoading,
    refetch: refetchTicket,
  } = useGetSupportTicketByIdQuery(activeChannel?.id || "", {
    skip: !shouldFetchTicket,
    pollingInterval: 6000,
  });

  const activeTicket = ticketDetailsData?.data || null;

  // Mark as read when opening channel
  React.useEffect(() => {
    if (activeChannel?.id && !isDirectPlaceholder && activeChannel.unreadCount > 0) {
      markAsRead(activeChannel.id);
    }
  }, [activeChannel?.id, isDirectPlaceholder, activeChannel?.unreadCount, markAsRead]);

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [activeTicket?.messages]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || messageText;
    if (!textToSend.trim()) return;

    const trimmed = textToSend.trim();
    if (!customText) setMessageText("");

    try {
      if (isDirectPlaceholder || !activeChannel?.id) {
        // Direct channel without ticket yet: initialize ticket
        const targetType = activeChannel?.channelType || "MANAGEMENT_ADMIN";
        const result = await createTicket({
          targetType,
          category: targetType === "CONSULTANT" ? "CASE_STATUS" : "GENERAL",
          subject: targetType === "CONSULTANT" ? "Case Advisory Chat" : "Support Desk Inquiry",
          initialMessage: trimmed,
          caseId: activeChannel?.caseInfo?.id,
        }).unwrap();

        if (result?.data?.id) {
          setSelectedChannelId(result.data.id);
          refetchConversations();
        }
      } else {
        // Send in existing ticket
        await sendMessage({
          ticketId: activeChannel.id,
          message: trimmed,
        }).unwrap();
        refetchTicket();
        refetchConversations();
      }
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to send message:", err);
      if (!customText) setMessageText(trimmed);
    }
  };

  // Handle Create New Conversation Topic
  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMessage.trim()) return;

    try {
      const result = await createTicket({
        targetType: newTargetType,
        category: newCategory,
        subject: newSubject.trim(),
        initialMessage: newInitialMessage.trim(),
        caseId: selectedCaseId || undefined,
      }).unwrap();

      setIsNewTicketModalOpen(false);
      setNewSubject("");
      setNewInitialMessage("");
      if (result?.data?.id) {
        setSelectedChannelId(result.data.id);
      }
      refetchConversations();
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  // Filtered Channels
  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (channel.subtitle && channel.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      channel.ticketCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (channelFilter === "CONSULTANT") return channel.channelType === "CONSULTANT";
    if (channelFilter === "MANAGEMENT") return channel.channelType === "MANAGEMENT_ADMIN";
    return true;
  });

  const overview = supportOverviewData?.data;
  const activeCases = overview?.activeCases || [];
  const central = overview?.centralSupport;

  return (
    <div className="space-y-4">
      {/* 1. TOP BREADCRUMB & HEADER SECTION (Site Signature Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border-b border-border/70 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <span>Support & Advisory Hub</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712] border border-[#F3A712]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F3A712] animate-pulse" />
              Direct Advisory
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-0.5">
            <span>Communications</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
            <span className="text-foreground font-bold">
              {isClientAccount ? "Advisory & Support Messenger" : "Staff Support Desk"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFaqModal(true)}
            className="cursor-pointer gap-1.5 font-semibold text-xs border-[#EAE6DF]"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#F3A712]" />
            <span>Knowledge Base & FAQs</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsNewTicketModalOpen(true)}
            className="cursor-pointer gap-1.5 font-bold text-xs bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-[#F3A712] dark:text-black shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Inquiry Topic</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI / ASSISTANCE QUICK HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Assigned Advisor */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between hover:border-[#F3A712]/40 transition-colors">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              ASSIGNED ADVISOR
            </div>
            <div className="text-sm font-bold text-foreground truncate mt-1">
              {overview?.assignedConsultant?.name || "Senior Immigration Advisor"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {overview?.assignedConsultant?.officeHours || "Mon-Fri: 9AM - 6PM EST"}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712] flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Central Hotline */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between hover:border-blue-500/30 transition-colors">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              OFFICIAL HOTLINE
            </div>
            <div className="text-sm font-bold text-foreground truncate mt-1">
              {central?.hotline || "+1 (800) 555-SKILL"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              Toll-free verification desk
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
            <PhoneCall className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Priority WhatsApp */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between hover:border-emerald-500/30 transition-colors">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              DIRECT WHATSAPP
            </div>
            <div className="text-sm font-bold text-foreground truncate mt-1">
              {overview?.assignedConsultant?.whatsapp || central?.whatsapp || "+1 (212) 555-0199"}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
              Online for urgent queries
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <MessageCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Guaranteed SLA */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between hover:border-purple-500/30 transition-colors">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              RESPONSE GUARANTEE
            </div>
            <div className="text-sm font-bold text-foreground truncate mt-1">
              Within 2-4 Business Hours
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              Archived in your legal case file
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. MAIN MESSENGER HUB (Two Column Editorial FinTech Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden h-[680px]">
        {/* LEFT COLUMN: Conversation Inbox & Channels (5 cols on lg) */}
        <div className="lg:col-span-4 border-r border-border flex flex-col h-full bg-[#FAF8F5]/60 dark:bg-card/40">
          {/* Search Header */}
          <div className="p-3.5 border-b border-border/80 space-y-2.5 bg-card/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations, advisor, case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#F3A712]/30 focus:border-[#F3A712]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-muted/70 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChannelFilter("ALL")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer",
                  channelFilter === "ALL"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Chats
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter("CONSULTANT")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer",
                  channelFilter === "CONSULTANT"
                    ? "bg-card text-[#B47B00] dark:text-[#F3A712] font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Advisor
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter("MANAGEMENT")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer",
                  channelFilter === "MANAGEMENT"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Support Desk
              </button>
            </div>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {isConversationsLoading ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-[#F3A712]" />
                <span>Connecting live desk...</span>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                <Inbox className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <p className="text-xs font-bold text-foreground">No channels found</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Click 'New Inquiry Topic' above to start a conversation
                </p>
              </div>
            ) : (
              filteredChannels.map((channel) => {
                const isSelected = channel.id === activeChannel?.id;
                const isConsultant = channel.channelType === "CONSULTANT";

                return (
                  <div
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-150",
                      isSelected
                        ? "bg-card border border-[#F3A712]/50 shadow-xs border-l-4 border-l-[#F3A712]"
                        : "hover:bg-muted/70 border border-transparent"
                    )}
                  >
                    {/* Avatar Icon with presence badge */}
                    <div className="relative shrink-0 mt-0.5">
                      <div
                        className={cn(
                          "h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shadow-xs border",
                          isConsultant
                            ? "bg-[#0a0a0a] text-[#F3A712] border-[#F3A712]/30"
                            : "bg-muted text-foreground border-border"
                        )}
                      >
                        {isConsultant ? (
                          <UserCheck className="h-5 w-5" />
                        ) : (
                          <Building2 className="h-5 w-5" />
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>

                    {/* Channel Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="text-xs font-bold text-foreground truncate">
                          {channel.title}
                        </h3>
                        {channel.lastMessage?.createdAt && (
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                            {new Date(channel.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                            isConsultant
                              ? "bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712]"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isConsultant ? "Assigned Advisor" : "Central Desk"}
                        </span>

                        {channel.subtitle && (
                          <span className="text-[10px] text-muted-foreground truncate font-medium">
                            {channel.subtitle}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate leading-snug">
                        {channel.lastMessage ? (
                          <>
                            {channel.lastMessage.isFromMe && <span className="font-semibold text-foreground">You: </span>}
                            <span>{channel.lastMessage.text}</span>
                          </>
                        ) : (
                          <span className="italic text-muted-foreground/70">Click to start messaging...</span>
                        )}
                      </p>
                    </div>

                    {/* Unread Counter Badge */}
                    {channel.unreadCount > 0 && (
                      <span className="shrink-0 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#F3A712] text-black shadow-xs animate-bounce">
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Window (7 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-background">
          {activeChannel ? (
            <>
              {/* Active Conversation Top Banner */}
              <div className="p-3.5 border-b border-border flex items-center justify-between gap-3 bg-card/80 backdrop-blur-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border",
                      activeChannel.channelType === "CONSULTANT"
                        ? "bg-[#0a0a0a] text-[#F3A712] border-[#F3A712]/30"
                        : "bg-muted text-foreground border-border"
                    )}
                  >
                    {activeChannel.channelType === "CONSULTANT" ? (
                      <UserCheck className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground truncate">
                        {activeTicket?.handlerInfo?.name || activeChannel.title}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712]">
                        {activeTicket?.handlerInfo?.role || activeChannel.avatarRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                      {activeChannel.caseInfo && (
                        <span className="text-foreground font-bold">
                          Case: {activeChannel.caseInfo.caseCode}
                        </span>
                      )}
                      {activeChannel.caseInfo && <span>•</span>}
                      <span>{activeChannel.contact?.officeHours || "Business Hours: 9 AM - 6 PM EST"}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Contacts */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {activeChannel.contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${activeChannel.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors border border-emerald-500/20 cursor-pointer"
                      title="Open WhatsApp Chat"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}

                  {activeChannel.contact?.phone && (
                    <a
                      href={`tel:${activeChannel.contact.phone}`}
                      className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border cursor-pointer"
                      title="Call Direct Phone"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}

                  {activeChannel.contact?.email && (
                    <a
                      href={`mailto:${activeChannel.contact.email}`}
                      className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border cursor-pointer"
                      title="Send Official Email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      refetchTicket();
                      refetchConversations();
                    }}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border cursor-pointer"
                    title="Refresh Messages"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Message Thread Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {isTicketLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs">
                    <Loader2 className="h-6 w-6 animate-spin mb-2 text-[#F3A712]" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : !activeTicket || activeTicket.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto p-6 space-y-3">
                    <div className="h-12 w-12 rounded-full bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712] flex items-center justify-center shadow-xs">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Start your advisory dialogue with {activeChannel.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Questions regarding immigration documentation, milestone installments, and wire settlements sent here are logged into your case file.
                    </p>

                    <div className="pt-2 text-left w-full space-y-1.5">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground text-center mb-1">
                        QUICK PROMPTS (CLICK TO SEND)
                      </div>
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(undefined, prompt)}
                          className="w-full text-left p-2.5 rounded-xl bg-card border border-border hover:border-[#F3A712]/60 hover:bg-[#FAF8F5]/80 dark:hover:bg-card text-xs text-foreground font-medium transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
                        >
                          <span>"{prompt}"</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#F3A712] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Official Legal & Audit Record Header Notice */}
                    <div className="flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold bg-card border border-border text-muted-foreground shadow-2xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>AdSkill Official Advisory Channel • End-to-End Audit Logged</span>
                      </div>
                    </div>

                    {/* Messages List */}
                    {activeTicket.messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;

                      return (
                        <div
                          key={msg.id || idx}
                          className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                        >
                          <div className={cn("flex items-end gap-2.5 max-w-[82%]", isMe && "flex-row-reverse")}>
                            {!isMe && (
                              <div className="h-7 w-7 rounded-full bg-[#0a0a0a] text-[#F3A712] flex items-center justify-center text-[11px] font-black shrink-0 border border-[#F3A712]/30 mb-1 shadow-2xs">
                                {msg.sender.name.charAt(0)}
                              </div>
                            )}

                            <div>
                              {!isMe && (
                                <div className="flex items-center gap-2 mb-1 ml-1">
                                  <span className="text-[11px] font-bold text-foreground">
                                    {msg.sender.name}
                                  </span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712] uppercase tracking-wider">
                                    {msg.sender.role?.name || (msg.isStaffReply ? "Staff" : "Client")}
                                  </span>
                                </div>
                              )}

                              {/* Message Bubble (Luxury Black for User, Card White for Staff) */}
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words shadow-2xs",
                                  isMe
                                    ? "bg-[#0a0a0a] text-white rounded-br-xs dark:bg-zinc-800 dark:text-zinc-100"
                                    : "bg-card border border-border text-foreground rounded-bl-xs"
                                )}
                              >
                                {msg.message}
                              </div>

                              {/* Timestamp and Read Status */}
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1 px-1",
                                  isMe ? "justify-end" : "justify-start"
                                )}
                              >
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {isMe && (
                                  <CheckCheck
                                    className={cn(
                                      "h-3 w-3",
                                      msg.readAt ? "text-[#F3A712]" : "text-muted-foreground"
                                    )}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Bottom Message Input Area */}
              <div className="p-3.5 border-t border-border bg-card space-y-2">
                {/* Quick chip suggestions if message is empty */}
                {!messageText && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap mr-1">
                      Quick:
                    </span>
                    {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMessageText(prompt)}
                        className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted border border-border text-[11px] text-muted-foreground hover:text-foreground font-medium whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {prompt.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Message ${activeChannel.title}... (Press Enter to send)`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#F3A712]/30 focus:border-[#F3A712]"
                  />

                  <Button
                    type="submit"
                    disabled={!messageText.trim() || isSendingMessage || isCreatingTicket}
                    className="h-10 px-5 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-[#F3A712] dark:text-black font-bold shadow-xs cursor-pointer"
                  >
                    {isSendingMessage || isCreatingTicket ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5 ml-1.5 text-[#F3A712] dark:text-black" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs">
              Select a conversation channel to start messaging
            </div>
          )}
        </div>
      </div>

      {/* 4. NEW INQUIRY MODAL (Site Signature FinTech Modal) */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712] flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Start a New Support or Advisory Topic
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select target recipient and describe your request
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="p-5 space-y-4">
              {/* Routing Cards */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider text-[10px]">
                  WHO IS THIS INQUIRY FOR?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewTargetType("CONSULTANT")}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all",
                      newTargetType === "CONSULTANT"
                        ? "border-[#F3A712] bg-[#F3A712]/10 ring-2 ring-[#F3A712]/20"
                        : "border-border hover:border-border/80"
                    )}
                  >
                    <UserCheck className="h-5 w-5 mb-1.5 text-[#F3A712]" />
                    <p className="text-xs font-bold text-foreground">Assigned Consultant</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                      Case status, legal filings, document reviews
                    </p>
                  </div>

                  <div
                    onClick={() => setNewTargetType("MANAGEMENT_ADMIN")}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all",
                      newTargetType === "MANAGEMENT_ADMIN"
                        ? "border-[#F3A712] bg-[#F3A712]/10 ring-2 ring-[#F3A712]/20"
                        : "border-border hover:border-border/80"
                    )}
                  >
                    <Building2 className="h-5 w-5 mb-1.5 text-foreground" />
                    <p className="text-xs font-bold text-foreground">Central Support Desk</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                      Bank wires, milestone plans, fee invoices
                    </p>
                  </div>
                </div>
              </div>

              {/* Case Dropdown if available */}
              {activeCases.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    RELATED CLIENT CASE (OPTIONAL)
                  </label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-foreground font-medium"
                  >
                    <option value="">General inquiry (No specific case attached)</option>
                    {activeCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseCode} — {c.serviceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  TOPIC SUBJECT
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wire Transfer Reference Verification"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-foreground font-medium"
                />
              </div>

              {/* Initial Message */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  INITIAL MESSAGE
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry with transaction dates, reference IDs or questions..."
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-foreground font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreatingTicket}
                  className="text-xs rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-[#F3A712] dark:text-black font-bold cursor-pointer"
                >
                  {isCreatingTicket ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Start Conversation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. FAQS & KNOWLEDGE BASE MODAL */}
      {showFaqModal && overview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#F3A712]/15 text-[#B47B00] dark:text-[#F3A712] flex items-center justify-center">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    AdSkill Advisory & Billing Knowledge Base
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Answers to common payment, invoice, and case milestone questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {overview.faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="pr-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B47B00] dark:text-[#F3A712]">
                          {faq.category}
                        </span>
                        <h4 className="text-xs font-bold text-foreground mt-0.5">
                          {faq.question}
                        </h4>
                      </div>
                      <ChevronDown
                        className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/60 bg-muted/20">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
