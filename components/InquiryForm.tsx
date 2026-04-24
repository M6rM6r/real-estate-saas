'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader as Loader2, Check, CircleAlert as AlertCircle, X } from 'lucide-react';

interface InquiryFormProps {
  slug: string;
  propertyId?: string;
  propertyTitle?: string;
  accentColor?: string;
  onSuccess?: () => void;
}

export function InquiryForm({
  slug,
  propertyId,
  propertyTitle,
  accentColor = '#2563eb',
  onSuccess,
}: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/${slug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          listing_id: propertyId,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل إرسال الاستفسار');
      }

      setStatus('success');
      setShowSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      onSuccess?.();

      setTimeout(() => {
        setShowSuccess(false);
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'حدث خطأ ما، يرجى المحاولة مرة أخرى'
      );
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-md">
      {showSuccess && (
        <div
          className="mb-4 rounded-lg p-4 border-l-4 flex items-start gap-3"
          style={{ backgroundColor: accentColor + '15', borderColor: accentColor }}
        >
          <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
          <div>
            <p className="font-semibold text-white">تم إرسال استفسارك بنجاح!</p>
            <p className="text-sm text-gray-300 mt-0.5">سنتواصل معك في أقرب وقت ممكن</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 rounded-lg p-4 border-l-4 border-red-500 bg-red-500/10 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
          <p className="text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        {propertyTitle && (
          <div className="p-3 rounded-lg border border-gray-700 bg-gray-800/50">
            <p className="text-xs text-gray-400">الاستفسار عن</p>
            <p className="font-semibold text-white text-sm truncate">{propertyTitle}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300 text-sm">
            الاسم الكامل *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="أحمد محمد"
            required
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-300 text-sm">
            رقم الجوال *
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+971 50 123 4567"
            required
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 text-sm">
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-gray-300 text-sm">
            الرسالة
          </Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="أخبرنا ما تبحث عنه..."
            rows={4}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full text-white font-semibold"
          style={{
            backgroundColor: accentColor,
          }}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            'إرسال الاستفسار'
          )}
        </Button>
      </form>
    </div>
  );
}
