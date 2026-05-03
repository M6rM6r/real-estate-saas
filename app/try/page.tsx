'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Sparkles, ArrowRight, Play, Loader2, Home, LayoutDashboard, Palette, BarChart3 } from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const enterDemo = () => {
    setIsLoading(true);
    sessionStorage.setItem('demo_auth', 'true');
    document.cookie = 'demo_session=1; path=/; max-age=86400; SameSite=Lax';
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] via-[#1a2f5a] to-[#0a0a1f]" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Header */}
        <header className="relative z-10 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Rew</span>
            </a>
            <a 
              href="/login" 
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              تسجيل الدخول
            </a>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-6 pt-12 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>جرب المنصة مجاناً</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              لوحة تحكم العقارات
              <span className="block text-blue-400">ببيانات تجريبية</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              استكشف كل الميزات: إدارة العروض، تصميم صفحة منشأتك، تحليلات الأداء، 
              وإدارة العملاء المحتملين — كل ذلك في تجربة تفاعلية كاملة.
            </p>

            {/* CTA Button */}
            <button
              onClick={enterDemo}
              disabled={isLoading}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-xl shadow-blue-900/40 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  ابدأ التجربة الآن
                  <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                </>
              )}
            </button>

            <p className="text-white/50 text-sm mt-4">
              لا حاجة لإنشاء حساب • بيانات تجريبية جاهزة
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 py-20 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            ما يمكنك استكشافه في التجربة
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl bg-[#12121a] border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Home className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">إدارة العروض</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                أضف، عدّل، ونظّم عروضك العقارية مع صور وتفاصيل شاملة
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl bg-[#12121a] border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">منشئ الصفحات</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                صمّم صفحة منشأتك بسحب وإفلات مع معاينة فورية
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl bg-[#12121a] border border-gray-800 hover:border-pink-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Palette className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">تخصيص التصميم</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                غيّر الألوان، الخطوط، والشعار ليناسب هوية علامتك
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-2xl bg-[#12121a] border border-gray-800 hover:border-green-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">التحليلات</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                تتبع مشاهدات العروض واستفسارات العملاء في real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Preview Section */}
      <div className="px-6 py-16 bg-gradient-to-b from-[#0a0a0f] to-[#0d1b3e]/30">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-gray-700 bg-[#12121a] shadow-2xl">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a2e] border-b border-gray-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0f] text-gray-400 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                  rew.app/dashboard
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Mock Stats */}
                <div className="md:col-span-2 space-y-4">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 p-6">
                    <p className="text-gray-400 text-sm mb-1">إجمالي المشاهدات</p>
                    <p className="text-3xl font-bold text-white">12,847</p>
                    <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                      <span>+24%</span>
                      <span className="text-gray-500">هذا الشهر</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-xl bg-[#1a1a2e] border border-gray-800 p-4">
                      <p className="text-gray-400 text-xs mb-1">العروض النشطة</p>
                      <p className="text-2xl font-bold text-white">24</p>
                    </div>
                    <div className="h-24 rounded-xl bg-[#1a1a2e] border border-gray-800 p-4">
                      <p className="text-gray-400 text-xs mb-1">الاستفسارات</p>
                      <p className="text-2xl font-bold text-white">156</p>
                    </div>
                  </div>
                </div>

                {/* Mock Quick Actions */}
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm mb-4">إجراءات سريعة</p>
                  <div className="h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center px-4">
                    <span className="text-blue-400 text-sm">+ عرض جديد</span>
                  </div>
                  <div className="h-10 rounded-lg bg-[#1a1a2e] border border-gray-800 flex items-center px-4">
                    <span className="text-gray-400 text-sm">تعديل الصفحة</span>
                  </div>
                  <div className="h-10 rounded-lg bg-[#1a1a2e] border border-gray-800 flex items-center px-4">
                    <span className="text-gray-400 text-sm">الرسائل</span>
                  </div>
                  <div className="h-10 rounded-lg bg-[#1a1a2e] border border-gray-800 flex items-center px-4">
                    <span className="text-gray-400 text-sm">الإعدادات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-16 bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            جاهز لاستكشاف المنصة؟
          </h2>
          <p className="text-gray-400 mb-8">
            انضم إلى مئات الوكالات العقارية التي تستخدم Rew لإدارة عروضها
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={enterDemo}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  ابدأ التجربة المجانية
                </>
              )}
            </button>
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200"
            >
              تسجيل الدخول
            </a>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="px-6 py-8 border-t border-gray-800 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Rew</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Rew. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
