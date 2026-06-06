import { useEffect, useState } from 'react';
import { listFaqItems, type FaqItem } from '../../core/network/contentApi';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listFaqItems()
      .then((items) => setFaqs(items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl space-y-3">
      <div className="mb-2">
        <h2 className="text-xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
        <p className="text-sm text-gray-500 mt-1">Find answers to the most common questions about Speakoo.</p>
      </div>

      {loading ? (
        <div className="card px-5 py-6 text-sm text-gray-500">Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="card px-5 py-6 text-sm text-gray-500">No FAQs available yet.</div>
      ) : faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`card px-5 cursor-pointer transition-all ${
              isOpen ? 'border-l-4 border-[#43A047]' : ''
            }`}
            onClick={() => setOpenId(isOpen ? null : faq.id)}
          >
            <div className="flex items-center justify-between py-4">
              <p className={`text-sm font-semibold pr-4 ${isOpen ? 'text-[#43A047]' : 'text-gray-900'}`}>
                {faq.question}
              </p>
              <div className="flex-shrink-0 text-gray-400">
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
            {isOpen && (
              <div className="pb-4 text-sm text-gray-600 leading-relaxed border-t border-[#EEEEEE] pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}

      {/* Contact Support */}
      <div className="card px-6 py-5 text-center mt-4">
        <p className="text-2xl mb-2">💬</p>
        <p className="font-bold text-gray-900">Still have questions?</p>
        <p className="text-sm text-gray-500 mt-1">Our support team is available 24/7.</p>
        <button className="btn-primary mt-4 px-8">Contact Support</button>
      </div>
    </div>
  );
}
