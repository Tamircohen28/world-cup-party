import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send } from 'lucide-react';

export default function MessageFeed({ matchId, currentUser }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const { data: messages } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: () => base44.entities.Message.filter({ match_id: matchId }, 'created_date', 100),
    initialData: [],
    enabled: !!matchId,
    refetchInterval: 10000, // poll every 10s
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.match_id === matchId) {
        queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      }
    });
    return unsub;
  }, [matchId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: () => base44.entities.Message.create({
      match_id: matchId,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      text: text.trim(),
    }),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
    },
  });

  const handleSend = () => {
    if (!text.trim() || sendMutation.isPending) return;
    sendMutation.mutate();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function initials(name) {
    return (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  function timeLabel(iso) {
    return new Date(iso).toLocaleTimeString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No messages yet — start the group chat! 💬
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {initials(msg.user_name)}
                </div>
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  {!isMe && (
                    <span className="text-xs text-muted-foreground font-medium px-1">{msg.user_name?.split(' ')[0]}</span>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">{timeLabel(msg.created_date)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something..."
          className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-all hover:bg-primary/90"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}