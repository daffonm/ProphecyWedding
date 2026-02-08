"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import Overlay from "@/components/Overlay";

import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";

import { useCollection } from "@/hooks/useCollection";
import { useDoc } from "@/hooks/useDoc";

import ArrowButton from "@/components/sub-components/ArrowButton";

// ---------- utils ----------
function makeChatId(a, b) {
  if (!a || !b) return null;
  return [a, b].sort().join("_");
}

function formatTime(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------- UI ----------
function ChatListItem({ chat, myUid, activeChatId, onSelect }) {
  const other = (chat.members || []).find((u) => u !== myUid) || null;
  const isActive = (chat.id || chat.chatId) === activeChatId;
  const unread = Number(chat?.unread?.[myUid] ?? 0);

  // ✅ profile per-row, bukan pakai peerProfile global
  const { data: rowPeerProfile } = useDoc("Users", other, { enabled: Boolean(other) });

  return (
    <button
      key={chat.id || chat.chatId}
      onClick={() => onSelect(chat)}
      className={`flex flex-row items-center px-1 py-2 w-full justify-between rounded-lg bd-6
        ${isActive ? "bg-gray-100" : "bg-white"}
      `}
    >
      <div className="flex flex-row items-center gap-2">
        <div>
          <div className="bg-gray-500 w-8 h-8 rounded-full" />
        </div>
        <div className="flex flex-col items-start">
          {/* ✅ hanya ganti sumber datanya, style tetap */}
          <p className="text-sm font-medium">
            {rowPeerProfile?.username || other || "Unknown"}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {chat?.lastMessage?.text || ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <p className="text-[10px] text-gray-500">{formatTime(chat?.lastMessage?.createdAt)}</p>
        {unread > 0 && (
          <div className="text-xs text-white w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            {unread}
          </div>
        )}
      </div>
    </button>
  );
}


function ChatBubble({ msg, time, isMe }) {
  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          px-4 py-2 rounded-xl max-w-[50%] text-sm
          wrap-break-words break-all
          ${isMe ? "bg-emerald-500 text-white" : "bg-white text-black"}
        `}
      >
        <p className="whitespace-pre-wrap">{msg}</p>
        <div className="flex justify-end mt-1">
          <span className="text-[10px] opacity-70">{time}</span>
        </div>
      </div>
    </div>
  );
}

function ChatPanel() {
  const {
    closeChat,
    chatList,
    chatListLoading,
    activeChatId,
    peerUid,
    peerProfile,
    messages,
    messagesLoading,
    message,
    setMessage,
    selectChat,
    sendMessage,
  } = useChat();

  const { user } = useAuth();
  const myUid = user?.uid || null;

  return (
    <div className="w-full h-full flex flex-row">
      {/* Left list */}
      <div className="border-r border-gray-300 w-2/4 h-full bg-gray-50">
        <div className="w-full flex flex-row items-center p-3 gap-4 border-b border-gray-300 bg-white">
            <ArrowButton cls="w-5 h-5" onClick={closeChat}/>
          <p className="text-lg bold">Chats</p>
        </div>

        <div className="flex flex-col py-0.5 px-1 gap-1 overflow-y-auto h-[calc(100%-56px)]">
          {chatListLoading && <div className="text-sm text-gray-500 p-2">Loading...</div>}

          {!chatListLoading && chatList.length === 0 && (
            <div className="text-sm text-gray-500 p-2">Belum ada chat.</div>
          )}

          {chatList.map((c) => (
            <ChatListItem
                key={c.id || c.chatId}
                chat={c}
                myUid={myUid}
                activeChatId={activeChatId}
                onSelect={selectChat}
            />
            ))}

        </div>
      </div>

      {/* Right room */}
      <div className="w-full h-full flex flex-col bg-gray-200">
        <div className="bg-white rounded-b-xl h-20 p-3 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="bg-gray-500 w-10 h-10 rounded-full" />
            <div className="flex flex-col">

              <div className="flex flex-row gap-3 items-baseline-last">
                <p className="text-sm font-semibold">
                    {peerProfile?.username || peerUid || "Select a chat"}
                </p>
                <p className="text-xs text-gray-500">{peerProfile?.role || ""}</p>
              </div>

                <p className="text-xs text-gray-500">{peerProfile?.email || peerUid || ""}</p>
            </div>
          </div>
        </div>

        <div className="w-full h-full px-4 py-2 overflow-y-auto no-scrollbar flex flex-col gap-y-2">
          {messagesLoading && <div className="text-sm text-gray-500">Loading messages...</div>}

          {!messagesLoading && messages.length === 0 && (
            <div className="text-sm text-gray-500">Belum ada pesan.</div>
          )}

          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              msg={m.text}
              isMe={m.senderId === myUid}
              time={formatTime(m.createdAt)}
            />
          ))}
        </div>

        <div className="bg-white w-full flex flex-row items-center justify-between pb-6 pt-3 px-4 gap-3 border-t border-gray-300">
          <input
            type="text"
            className="p-2 rounded-full w-full text-sm outline-0 bd-6 bg-gray-200"
            placeholder="Enter Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={!activeChatId}
          />
          <button
            className=" bg-emerald-500 text-white rounded-full text-sm px-4 disabled:opacity-50 w-14 h-9 overflow-hidden flex items-center justify-center"
            onClick={sendMessage}
            disabled={!activeChatId}
          >
            <img src="/icons/icons8-send-30.png" alt="" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Context ----------
const ChatContext = createContext(null);

export default function ChatProvider({ children }) {
  const { user } = useAuth();
  const myUid = user?.uid || null;

  const { colRef, query, where, orderBy, serverTimestamp, setDoc, addDoc, updateDoc } = useDb();

  const [toggleChat, setToggleChat] = useState(false);

  const [activeChatId, setActiveChatId] = useState(null);
  const [peerUid, setPeerUid] = useState(null);
  const [message, setMessage] = useState("");

  // ---- Chat List (realtime) via useCollection ----
  const chatListQuery = useMemo(() => {
    if (!myUid) return null;
    return () => query(colRef("Chats"), where("members", "array-contains", myUid), orderBy("updatedAt", "desc"));
  }, [myUid, query, colRef, where, orderBy]);

  const { rows: chatList, loading: chatListLoading } = useCollection(chatListQuery, [myUid], {
    enabled: Boolean(myUid),
  });

  // ---- Peer Profile (optional) via useDoc ----
  // Asumsi kamu punya Users collection. Kalau tidak ada, kamu bisa matiin ini.
  const { data: peerProfile } = useDoc("Users", peerUid, { enabled: Boolean(peerUid) });

  // ---- Messages (realtime) via useCollection ----
  const messagesQuery = useMemo(() => {
    if (!activeChatId) return null;
    return () => query(colRef(`Chats/${activeChatId}/Messages`), orderBy("createdAt", "asc"));
  }, [activeChatId, query, colRef, orderBy]);

  const { rows: messages, loading: messagesLoading } = useCollection(messagesQuery, [activeChatId], {
    enabled: Boolean(activeChatId),
  });

  // ---- Mark unread as read when open chat ----
  useEffect(() => {
    if (!myUid || !activeChatId) return;
    updateDoc("Chats", activeChatId, {
      [`unread.${myUid}`]: 0,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }, [myUid, activeChatId, updateDoc, serverTimestamp]);

  // ---- Actions ----
  const openChat = () => setToggleChat(true);
  const closeChat = () => setToggleChat(false);

  const openChatToUserId = async (targetUid) => {
    if (!myUid) throw new Error("User belum login.");
    if (!targetUid) throw new Error("targetUid kosong.");
    if (targetUid === myUid) throw new Error("Tidak bisa chat dengan diri sendiri.");

    const chatId = makeChatId(myUid, targetUid);

    setToggleChat(true);
    setActiveChatId(chatId);
    setPeerUid(targetUid);

    await setDoc(
      "Chats",
      chatId,
      {
        chatId,
        members: [myUid, targetUid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unread: { [myUid]: 0, [targetUid]: 0 },
      },
      { merge: true }
    );
  };

  const selectChat = (chat) => {
    const other = (chat?.members || []).find((u) => u !== myUid) || null;
    setActiveChatId(chat?.id || chat?.chatId || null);
    setPeerUid(other);
    setToggleChat(true);
  };

  const sendMessage = async () => {
    const text = String(message || "").trim();
    if (!text) return;
    if (!myUid || !activeChatId || !peerUid) return;

    setMessage("");

    // 1) add message
    await addDoc(`Chats/${activeChatId}/Messages`, {
      chatId: activeChatId,
      senderId: myUid,
      text,
      createdAt: serverTimestamp(),
    });

    // 2) update summary + unread peer
    const peerUnreadNow = Number(
      chatList.find((c) => (c.id || c.chatId) === activeChatId)?.unread?.[peerUid] ?? 0
    );

    await updateDoc("Chats", activeChatId, {
      updatedAt: serverTimestamp(),
      lastMessage: { text, senderId: myUid, createdAt: serverTimestamp() },
      [`unread.${peerUid}`]: peerUnreadNow + 1,
    });
  };

  const unreadCount = useMemo(() => {
    if (!myUid) return 0;
    return (chatList || []).reduce((sum, c) => sum + Number(c?.unread?.[myUid] ?? 0), 0);
    }, [chatList, myUid]);

    const hasUnread = unreadCount > 0;

    // Optional: unread per chatId (untuk badge per row)
    const getUnreadByChatId = useMemo(() => {
    return (chatId) => {
        if (!myUid || !chatId) return 0;
        const chat = (chatList || []).find((c) => (c.id || c.chatId) === chatId);
        return Number(chat?.unread?.[myUid] ?? 0);
    };
    }, [chatList, myUid]);


  const value = useMemo(
    () => ({
      isOpen: toggleChat,
      openChat,
      closeChat,
      openChatToUserId,

      chatList,
      chatListLoading,

      unreadCount,
      hasUnread,
      getUnreadByChatId,

      activeChatId,
      peerUid,
      peerProfile,

      messages,
      messagesLoading,

      message,
      setMessage,
      sendMessage,

      selectChat,
    }),
    [
      toggleChat,
      chatList,
      chatListLoading,
      activeChatId,
      peerUid,
      peerProfile,
      messages,
      messagesLoading,
      message,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      <Overlay
        isOpen={toggleChat}
        onClose={closeChat}
        contentClassName="absolute bg-gray-100 min-w-210 h-170 rounded-lg overflow-hidden bottom-7 right-10"
      >
        <ChatPanel />
      </Overlay>

      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat() harus dipakai di dalam <ChatProvider>.");
  return ctx;
}
