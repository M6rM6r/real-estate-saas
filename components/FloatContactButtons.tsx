'use client';

interface FloatContactButtonsProps {
  whatsapp?: string;
  accentColor?: string;
}

export function FloatContactButtons({ whatsapp, accentColor = '#2563eb' }: FloatContactButtonsProps) {
  if (!whatsapp) return null;

  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أريد الاستفسار')}`;

  return (
    <>
      <style>{`
        @keyframes float-ping {
          0%,100%{transform:scale(1);opacity:.6}
          60%{transform:scale(1.7);opacity:0}
        }
        .float-ping{animation:float-ping 2.4s cubic-bezier(.4,0,.6,1) infinite}
        @media(prefers-reduced-motion:reduce){.float-ping{animation:none}}
        @keyframes float-bounce {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-4px)}
        }
        .float-bounce{animation:float-bounce 3s ease-in-out infinite}
      `}</style>

      <div className="fixed bottom-5 left-4 sm:bottom-7 sm:left-6 z-50 flex flex-col items-center gap-2">
        {/* Tooltip label */}
        <span
          className="text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg select-none pointer-events-none"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: '0 4px 14px rgba(37,211,102,0.4)' }}
        >
          واتساب
        </span>

        {/* Button */}
        <div className="relative float-bounce">
          {/* Pulse ring */}
          <span
            className="float-ping absolute inset-0 rounded-full"
            style={{ backgroundColor: '#25D366' }}
          />
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل عبر واتساب"
            className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white active:scale-90 transition-transform duration-150 select-none"
            style={{
              background: 'linear-gradient(135deg,#25D366 0%,#128C7E 100%)',
              boxShadow: '0 8px 28px rgba(37,211,102,0.5), 0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7 sm:w-8 sm:h-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
