"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import {
  Send,
  User,
  Loader2,
  RotateCcw,
  TrendingUp,
  Target,
  Award,
  X,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarkdownContent } from "@/components/ui/markdown-content"
import { SpeakBotMark } from "@/components/speakbot/speakbot-logo"
import {
  feedbackAPI,
  type SpeakBotMessage,
  type SpeakBotResponse,
  type SpeakBotSummary,
} from "@/lib/api/feedbackApi"

interface SpeakBotDrawerProps {
  experienceId?: string
  experienceTopic?: string
  triggerButton?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

interface QuickPromptItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  query: string
}

function getQuickPrompts(topic?: string): QuickPromptItem[] {
  return [
    {
      icon: TrendingUp,
      label: "Performance",
      query: topic
        ? `What were the lowest and highest rated areas for "${topic}", and why?`
        : "Which talk didn't perform well, which one performed best, and why?",
    },
    {
      icon: Target,
      label: "3 Improvements",
      query: topic
        ? `Based on attendee feedback for "${topic}", give me 3 specific actionable things to improve.`
        : "Based on all my feedback, give me 3 specific actionable things to improve for my next presentation.",
    },
    {
      icon: Award,
      label: "Top Praise",
      query: topic
        ? `Summarize what attendees loved most and what they praised for "${topic}".`
        : "Summarize what attendees loved most and what they praised across my talks.",
    },
  ]
}

// ─── Subcomponents (Memoized to prevent keystroke lag) ─────────────────────────

interface ChatMessageItemProps {
  message: SpeakBotMessage
}

const ChatMessageItem = memo(function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isAssistant = message.role === "assistant"
  return (
    <div
      className={`flex gap-1.5 sm:gap-2 ${
        isAssistant ? "items-start" : "items-end justify-end"
      }`}
    >
      {isAssistant && (
        <>
          <SpeakBotMark size={20} animated={false} className="mt-0.5 shrink-0 sm:hidden" />
          <SpeakBotMark size={24} animated={false} className="mt-0.5 shrink-0 hidden sm:block" />
        </>
      )}

      <div
        className={`rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 max-w-[84%] sm:max-w-[80%] text-[11.5px] sm:text-[13px] leading-snug sm:leading-relaxed ${
          isAssistant
            ? "bg-slate-900/80 border border-slate-800/80 text-slate-200 rounded-tl-xs shadow-2xs"
            : "bg-orange-600 text-white rounded-br-xs shadow-2xs"
        }`}
      >
        {isAssistant ? (
          <MarkdownContent
            content={message.content}
            className="text-[11.5px] sm:text-[13px] leading-snug sm:leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:mb-1.5 [&_ul:last-child]:mb-0 [&_ol]:mb-1.5 [&_ol:last-child]:mb-0 [&_li]:mb-0.5 [&_h1]:text-xs [&_h2]:text-xs [&_h3]:text-xs [&_h1]:mt-1.5 [&_h2]:mt-1 [&_h3]:mt-1 [&_h1]:mb-0.5 [&_h2]:mb-0.5 [&_h3]:mb-0.5"
          />
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>

      {!isAssistant && (
        <div className="h-5 w-5 sm:h-5.5 sm:w-5.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 mb-0.5">
          <User className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  )
})
ChatMessageItem.displayName = "ChatMessageItem"

interface ChatMessageListProps {
  messages: SpeakBotMessage[]
  loading: boolean
}

const ChatMessageList = memo(function ChatMessageList({ messages, loading }: ChatMessageListProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when new messages arrive or loading state changes
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight
    }
  }, [messages.length, loading])

  return (
    <div
      ref={scrollViewportRef}
      className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 min-h-0"
    >
      {messages.map((msg, index) => (
        <ChatMessageItem key={index} message={msg} />
      ))}

      {loading && (
        <div className="flex gap-1.5 sm:gap-2 items-start">
          <SpeakBotMark size={20} animated={false} className="shrink-0 sm:hidden" />
          <SpeakBotMark size={24} animated={false} className="shrink-0 hidden sm:block" />
          <div className="rounded-2xl rounded-tl-xs px-2.5 py-1.5 bg-slate-900/80 border border-slate-800/80 text-slate-400 flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Loader2 className="h-3 w-3 animate-spin text-orange-400 shrink-0" />
            <span>Evaluating feedback trends…</span>
          </div>
        </div>
      )}
    </div>
  )
})
ChatMessageList.displayName = "ChatMessageList"

interface QuickPromptsBarProps {
  prompts: QuickPromptItem[]
  onSelectPrompt: (query: string) => void
  disabled: boolean
}

const QuickPromptsBar = memo(function QuickPromptsBar({ prompts, onSelectPrompt, disabled }: QuickPromptsBarProps) {
  return (
    <div className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 border-t border-slate-800/70 bg-slate-900/30">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {prompts.map((prompt, i) => {
          const Icon = prompt.icon
          return (
            <button
              key={i}
              onClick={() => onSelectPrompt(prompt.query)}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-800/70 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 shrink-0" />
              <span>{prompt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
QuickPromptsBar.displayName = "QuickPromptsBar"

interface SpeakBotChatInputProps {
  onSend: (text: string) => void
  loading: boolean
}

/**
 * Isolated input bar with local state to ensure instant typing response
 * without triggering re-renders of the messages list or Markdown parsing.
 */
function SpeakBotChatInput({ onSend, loading }: SpeakBotChatInputProps) {
  const [input, setInput] = useState("")

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 border-t border-slate-800 bg-slate-900/90">
      <div className="relative flex items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about ratings or suggestions…"
          disabled={loading}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="pr-9 pl-3 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-orange-500 rounded-full text-xs sm:text-sm h-9 sm:h-10"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="absolute right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
          ) : (
            <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          )}
        </Button>
      </div>

      <div className="hidden sm:flex items-center justify-between mt-1.5 text-[10px] text-slate-500 px-1">
        <span>Audience feedback intelligence</span>
        <span>Confidential & private</span>
      </div>
    </div>
  )
}

interface ConversationState {
  messages: SpeakBotMessage[]
  lastSummary: SpeakBotSummary | null
}

function createWelcomeMessage(topic?: string): SpeakBotMessage {
  const scope = topic ? `for **"${topic}"**` : "across your talks"
  return {
    role: "assistant",
    content: `Attendee feedback ${scope} is ready. Ask about your ratings, strengths, or tap an insight below.`,
  }
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export function SpeakBotDrawer({
  experienceId,
  experienceTopic,
  triggerButton = true,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: SpeakBotDrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const setIsOpen = isControlled ? controlledOnOpenChange || (() => {}) : setInternalIsOpen

  // Unique identifier for the active presentation scope or global dashboard
  const activeScopeKey = experienceId || experienceTopic || "__all__"

  const [conversations, setConversations] = useState<Record<string, ConversationState>>({})
  const [loading, setLoading] = useState(false)

  // Current scope conversation data
  const activeConversation = conversations[activeScopeKey]
  const messages = useMemo(() => {
    if (activeConversation && activeConversation.messages.length > 0) {
      return activeConversation.messages
    }
    return isOpen ? [createWelcomeMessage(experienceTopic)] : []
  }, [activeConversation, isOpen, experienceTopic])

  const lastSummary = activeConversation?.lastSummary ?? null

  const conversationsRef = useRef(conversations)
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  // Synchronize initial welcome message into conversations dictionary when drawer is open
  useEffect(() => {
    if (isOpen) {
      setConversations((prev) => {
        const existing = prev[activeScopeKey]
        if (!existing || existing.messages.length === 0) {
          return {
            ...prev,
            [activeScopeKey]: {
              messages: [createWelcomeMessage(experienceTopic)],
              lastSummary: existing?.lastSummary ?? null,
            },
          }
        }
        // If there is only the single initial assistant greeting, update it to match current topic
        if (
          existing.messages.length === 1 &&
          existing.messages[0].role === "assistant"
        ) {
          const freshGreeting = createWelcomeMessage(experienceTopic)
          if (existing.messages[0].content !== freshGreeting.content) {
            return {
              ...prev,
              [activeScopeKey]: {
                messages: [freshGreeting],
                lastSummary: existing.lastSummary,
              },
            }
          }
        }
        return prev
      })
    }
  }, [isOpen, activeScopeKey, experienceTopic])

  const handleSend = useCallback(
    async (textToSend: string) => {
      const cleanText = textToSend.trim()
      if (!cleanText || loading) return

      const scopeKey = activeScopeKey
      const currentConversation = conversationsRef.current[scopeKey]
      const currentMessages =
        currentConversation && currentConversation.messages.length > 0
          ? currentConversation.messages
          : [createWelcomeMessage(experienceTopic)]

      const newMessages: SpeakBotMessage[] = [
        ...currentMessages,
        { role: "user", content: cleanText },
      ]

      setConversations((prev) => ({
        ...prev,
        [scopeKey]: {
          messages: newMessages,
          lastSummary: prev[scopeKey]?.lastSummary ?? null,
        },
      }))
      setLoading(true)

      try {
        const historyToSend = newMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response: SpeakBotResponse = await feedbackAPI.askSpeakBot({
          query: cleanText,
          experience: experienceId,
          history: historyToSend,
        })

        setConversations((prev) => {
          const existing = prev[scopeKey]?.messages ?? newMessages
          return {
            ...prev,
            [scopeKey]: {
              messages: [
                ...existing,
                { role: "assistant", content: response.reply },
              ],
              lastSummary: response.summary ?? prev[scopeKey]?.lastSummary ?? null,
            },
          }
        })
      } catch (error: any) {
        console.error("SpeakBot query failed:", error)
        setConversations((prev) => {
          const existing = prev[scopeKey]?.messages ?? newMessages
          return {
            ...prev,
            [scopeKey]: {
              messages: [
                ...existing,
                {
                  role: "assistant",
                  content:
                    "Could not reach the coaching service right now. Please verify your connection or try again shortly.",
                },
              ],
              lastSummary: prev[scopeKey]?.lastSummary ?? null,
            },
          }
        })
      } finally {
        setLoading(false)
      }
    },
    [activeScopeKey, experienceId, experienceTopic, loading]
  )

  const handleResetChat = useCallback(() => {
    setConversations((prev) => ({
      ...prev,
      [activeScopeKey]: {
        messages: [createWelcomeMessage(experienceTopic)],
        lastSummary: null,
      },
    }))
  }, [activeScopeKey, experienceTopic])

  const quickPrompts = useMemo(() => getQuickPrompts(experienceTopic), [experienceTopic])

  return (
    <>
      {/* Floating Trigger — compact icon-only FAB on mobile, expanded pill on desktop */}
      {triggerButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center sm:justify-start sm:gap-2.5 h-12 w-12 sm:h-auto sm:w-auto p-0 sm:pl-2.5 sm:pr-4 sm:py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-150 hover:border-slate-500 active:scale-[0.95] group"
          aria-label="Open SpeakBot Coach"
          title="Open SpeakBot Coach"
        >
          <div className="shrink-0 flex items-center justify-center">
            <SpeakBotMark size={30} />
          </div>
          <span className="hidden sm:inline font-semibold text-xs sm:text-sm tracking-tight text-slate-200 group-hover:text-white whitespace-nowrap">
            SpeakBot Coach
          </span>
        </button>
      )}

      {/* Side-Over Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          hideCloseButton
          className="w-full sm:max-w-lg p-0 flex flex-col bg-slate-950 border-l border-slate-800 text-slate-100 shadow-2xl"
        >
          {/* Accessible hidden titles required by Radix */}
          <SheetHeader className="sr-only">
            <SheetTitle>SpeakBot Coach</SheetTitle>
            <SheetDescription>AI-powered speaker performance analysis</SheetDescription>
          </SheetHeader>

          {/* Visible Header */}
          <div className="flex-shrink-0 px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-800/80 bg-slate-900/90">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <SpeakBotMark size={28} className="shrink-0 sm:hidden" />
                <SpeakBotMark size={34} className="shrink-0 hidden sm:block" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                      SpeakBot Coach
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 bg-slate-800 px-1 sm:px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[190px] sm:max-w-xs mt-0.5">
                    {experienceTopic
                      ? `Focus: ${experienceTopic}`
                      : "Speaking performance & audience analysis"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar if summary available — compact horizontal badge pills */}
            {lastSummary && (
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono shrink-0">
                  <span className="text-slate-400">Score</span>
                  <span className="font-semibold text-slate-100">
                    {lastSummary.avg_rating !== null ? `${lastSummary.avg_rating}/10` : "—"}
                  </span>
                </div>
                {lastSummary.top_strength && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] shrink-0 text-emerald-400 font-medium">
                    <span className="opacity-70">★</span>
                    <span className="truncate max-w-[110px]">{lastSummary.top_strength}</span>
                  </div>
                )}
                {lastSummary.top_growth_area && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] shrink-0 text-amber-400 font-medium">
                    <span className="opacity-70">Focus:</span>
                    <span className="truncate max-w-[110px]">{lastSummary.top_growth_area}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Messages Scroll Area (Memoized) */}
          <ChatMessageList messages={messages} loading={loading} />

          {/* Quick Prompt Chips (Memoized) */}
          <QuickPromptsBar prompts={quickPrompts} onSelectPrompt={handleSend} disabled={loading} />

          {/* Input Footer (Isolated Local State for Instant 60fps Typing) */}
          <SpeakBotChatInput onSend={handleSend} loading={loading} />
        </SheetContent>
      </Sheet>
    </>
  )
}

