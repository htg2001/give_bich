import React, { useState } from 'react';
import { CardMessageData } from './GreetingCard';
import { X, Check, Sparkles } from 'lucide-react';

interface EditMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CardMessageData;
  onSave: (newData: CardMessageData) => void;
}

export const EditMessageModal: React.FC<EditMessageModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const [occasion, setOccasion] = useState(data.occasion);
  const [title, setTitle] = useState(data.title);
  const [paragraphsText, setParagraphsText] = useState(data.paragraphs.join('\n\n'));
  const [signature, setSignature] = useState(data.signature);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const splitParagraphs = paragraphsText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    onSave({
      occasion: occasion.trim() || 'Gửi cậu, nhân ngày 20/10',
      title: title.trim() || 'Chúc cậu luôn rực rỡ 🌷',
      paragraphs: splitParagraphs.length > 0 ? splitParagraphs : data.paragraphs,
      signature: signature.trim() || 'Chúc cậu luôn hạnh phúc 💗',
      recipient: data.recipient,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3
              id="edit-modal-title"
              className="text-lg font-bold text-rose-900"
              style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif" }}
            >
              Chỉnh Sửa Lời Chúc
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
              Dịp / Tiêu Đề Nhỏ
            </label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
              placeholder="VD: Gửi cậu, nhân ngày 20/10"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
              Tiêu Đề Chính
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
              placeholder="VD: Chúc cậu luôn rực rỡ 🌷"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
              Nội Dung Lời Nhắn (Mỗi đoạn cách nhau một dòng)
            </label>
            <textarea
              rows={5}
              value={paragraphsText}
              onChange={(e) => setParagraphsText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
              placeholder="Viết lời nhắn gửi yêu thương tại đây..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
              Chữ Ký / Lời Kết
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
              placeholder="VD: Chúc cậu luôn hạnh phúc 💗"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Lời Chúc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
