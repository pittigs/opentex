import React, { useState } from 'react';
import { 
  MessageSquare, 
  Check, 
  X, 
  Send, 
  Plus
} from 'lucide-react';
import type { DocumentComment, TrackChangeSuggestion } from '../../types';

interface ReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: DocumentComment[];
  suggestions: TrackChangeSuggestion[];
  onAddComment: (content: string, line: number) => void;
  onResolveComment: (id: string) => void;
  onReplyComment: (commentId: string, replyText: string) => void;
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onJumpToLine?: (line: number) => void;
  activeLine?: number;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  isOpen,
  onClose,
  comments,
  suggestions,
  onAddComment,
  onResolveComment,
  onReplyComment,
  onAcceptSuggestion,
  onRejectSuggestion,
  onJumpToLine,
  activeLine = 1
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'suggestions'>('comments');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyInput, setReplyInput] = useState<{ [commentId: string]: string }>({});
  const [showResolved, setShowResolved] = useState(false);

  if (!isOpen) return null;

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      onAddComment(newCommentText.trim(), activeLine);
      setNewCommentText('');
    }
  };

  const handleSendReply = (commentId: string) => {
    const text = replyInput[commentId];
    if (text && text.trim()) {
      onReplyComment(commentId, text.trim());
      setReplyInput(prev => ({ ...prev, [commentId]: '' }));
    }
  };

  const filteredComments = showResolved 
    ? comments 
    : comments.filter(c => !c.resolved);

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900/95 flex flex-col h-full z-20 select-none shadow-xl">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Review & Track Changes</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] gap-1">
        <button
          onClick={() => setActiveTab('comments')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'comments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Kommentare ({comments.filter(c => !c.resolved).length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'suggestions' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Vorschläge ({suggestions.filter(s => s.status === 'pending').length})
        </button>
      </div>

      {/* New Comment Input */}
      {activeTab === 'comments' && (
        <div className="p-3 border-b border-slate-800 bg-slate-950/40">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
            <span>Kommentar zu <strong>Zeile {activeLine}</strong>:</span>
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="text-[10px] text-indigo-400 hover:underline"
            >
              {showResolved ? 'Gelöste ausblenden' : 'Alle anzeigen'}
            </button>
          </div>
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Schreibe eine Anmerkung..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddComment}
              disabled={!newCommentText.trim()}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="p-3 overflow-y-auto flex-1 space-y-3">
        {activeTab === 'comments' ? (
          filteredComments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs italic">
              Keine offenen Kommentare.
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                onClick={() => onJumpToLine?.(comment.line)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  comment.resolved
                    ? 'bg-slate-950/30 border-slate-800 opacity-60'
                    : 'bg-slate-800/50 border-slate-700/70 hover:border-emerald-500/50 shadow-sm'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow"
                      style={{ backgroundColor: comment.color }}
                    >
                      {comment.avatar}
                    </div>
                    <span className="text-xs font-medium text-slate-200">{comment.author}</span>
                    <span className="text-[10px] text-indigo-400 font-mono bg-slate-900 px-1 rounded">
                      Z.{comment.line}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveComment(comment.id);
                    }}
                    className={`p-1 rounded transition text-xs flex items-center space-x-1 ${
                      comment.resolved
                        ? 'text-slate-500 hover:text-slate-300'
                        : 'text-slate-400 hover:text-emerald-400'
                    }`}
                    title={comment.resolved ? 'Wiedereröffnen' : 'Als erledigt markieren'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Body */}
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  {comment.content}
                </p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 pl-7 space-y-1.5">
                    {comment.replies.map((rep) => (
                      <div key={rep.id} className="text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <span className="font-semibold text-slate-300">{rep.author}: </span>
                        <span className="text-slate-400">{rep.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {!comment.resolved && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2.5 pl-7 flex items-center space-x-1"
                  >
                    <input
                      type="text"
                      value={replyInput[comment.id] || ''}
                      onChange={(e) => setReplyInput({ ...replyInput, [comment.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply(comment.id)}
                      placeholder="Antworten..."
                      className="flex-1 bg-slate-900 border border-slate-700 text-[11px] px-2 py-1 rounded text-white outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      className="p-1 text-indigo-400 hover:text-indigo-300"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          /* Suggestions Tab */
          suggestions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs italic">
              Keine ausstehenden Textvorschläge.
            </div>
          ) : (
            suggestions.map((sug) => (
              <div
                key={sug.id}
                onClick={() => onJumpToLine?.(sug.line)}
                className="p-3 rounded-xl border border-slate-700/70 bg-slate-800/40 space-y-2 cursor-pointer hover:border-indigo-500/50"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{sug.author}</span>
                  <span className="text-[10px] text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                    Zeile {sug.line}
                  </span>
                </div>

                {/* Diff view */}
                <div className="text-xs font-mono rounded bg-slate-950 p-2 space-y-1">
                  <div className="text-rose-400 line-through opacity-80">- {sug.originalText}</div>
                  <div className="text-emerald-400 font-semibold">+ {sug.suggestedText}</div>
                </div>

                {/* Actions */}
                {sug.status === 'pending' ? (
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRejectSuggestion(sug.id);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded text-[11px] flex items-center space-x-1 transition"
                    >
                      <X className="w-3 h-3" />
                      <span>Ablehnen</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptSuggestion(sug.id);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] flex items-center space-x-1 font-medium transition"
                    >
                      <Check className="w-3 h-3" />
                      <span>Annehmen</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-right font-medium capitalize text-slate-400">
                    Status: {sug.status}
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
