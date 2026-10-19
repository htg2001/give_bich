import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GiftBox3D } from './components/GiftBox3D';
import { GreetingCard } from './components/GreetingCard';
import { PetalBackground } from './components/PetalBackground';
import { PhotoGallery } from './components/PhotoGallery';
import { GiftOpeningStage } from './utils/gesture';
import { SoundEngine } from './utils/sound';
import { giftConfig } from './gift.config';
import { Volume2, VolumeX, Sparkles, ChevronsDown } from 'lucide-react';

if (giftConfig.music?.trim()) {
  SoundEngine.setMusicSource(giftConfig.music);
}

const hasImages = giftConfig.images.some((image) =>
  (typeof image === 'string' ? image : image.src).trim() !== ''
);
const GALLERY_SECTION_ID = 'photo-gallery';

interface BurstHeart {
  id: number;
  char: string;
  dx: number;
  dy: number;
  rot: number;
}

const BURST_SYMBOLS = ['💗', '💖', '💕', '✨', '🌸', '🎀', '💘', '🌷', '💝'];
const AUTO_BURST_MIN_DELAY_MS = 3000;
const AUTO_BURST_MAX_DELAY_MS = 8000;

export default function App() {
  const [stage, setStage] = useState<GiftOpeningStage>('idle');
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  const [burstItems, setBurstItems] = useState<BurstHeart[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopMusicAutoStartRef = useRef<() => void>(() => {});

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const burstHearts = useCallback((count = 38) => {
    const newItems: BurstHeart[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      char: BURST_SYMBOLS[Math.floor(Math.random() * BURST_SYMBOLS.length)],
      dx: (Math.random() - 0.5) * 360,
      dy: -50 - Math.random() * 260,
      rot: (Math.random() - 0.5) * 260,
    }));

    setBurstItems((prev) => [...prev, ...newItems]);
    SoundEngine.playHeartPop();

    setTimeout(() => {
      setBurstItems((prev) => prev.filter((item) => !newItems.includes(item)));
    }, 2000);
  }, []);

  // Sequence: User double taps -> Zoom to top -> Untie Bow -> Open Lid -> Reveal Card -> Card Open
  const handleOpenGift = useCallback(() => {
    if (stage !== 'idle') return;

    clearAllTimeouts();
    setStage('focusing_top');

    // Automatically start melody on interaction if not already on
    SoundEngine.startMusic(setMusicPlaying);

    // Phase 1: Untie the Bow
    const t1 = setTimeout(() => {
      setStage('untying_bow');
      SoundEngine.playUntieBow();
    }, 650);

    // Phase 2: Open Lid
    const t2 = setTimeout(() => {
      setStage('opening_lid');
      SoundEngine.playLidPop();
    }, 1750);

    // Phase 3: Card emerges from inside box
    const t3 = setTimeout(() => {
      setStage('revealing_card');
      SoundEngine.playSparkle();
    }, 2600);

    // Phase 4: Card settles into full view
    const t4 = setTimeout(() => {
      setStage('card_open');
      burstHearts(48);
    }, 3400);

    timeoutsRef.current = [t1, t2, t3, t4];
  }, [stage, burstHearts]);

  const handleReplay = useCallback(() => {
    clearAllTimeouts();
    setStage('idle');
    SoundEngine.playSparkle();
  }, []);

  const handleToggleMusic = () => {
    // Người dùng đã tự bật/tắt thì không tự bật nhạc lại ở lần chạm sau nữa.
    stopMusicAutoStartRef.current();
    SoundEngine.toggleMusic((playing) => {
      setMusicPlaying(playing);
    });
  };

  // Trình duyệt chặn tự phát nhạc có tiếng nên thử phát ngay khi mở trang, bị chặn thì bật ở lần chạm/click/phím đầu tiên.
  useEffect(() => {
    const interactionEvents = ['pointerdown', 'touchend', 'click', 'keydown'] as const;
    let isListening = true;

    const stopListening = () => {
      if (!isListening) return;
      isListening = false;
      interactionEvents.forEach((eventName) =>
        window.removeEventListener(eventName, handleFirstInteraction, true)
      );
    };

    const tryStartMusic = () => {
      SoundEngine.startMusic(setMusicPlaying).then((started) => {
        if (started) stopListening();
      });
    };

    function handleFirstInteraction(event: Event) {
      // Bấm vào nút nhạc thì để nút tự xử lý, nếu không nhạc vừa bật sẽ bị nút tắt ngay.
      if (event.target instanceof Element && event.target.closest('[data-music-toggle]')) return;
      tryStartMusic();
    }

    interactionEvents.forEach((eventName) =>
      window.addEventListener(eventName, handleFirstInteraction, true)
    );
    stopMusicAutoStartRef.current = stopListening;
    tryStartMusic();

    return stopListening;
  }, []);

  // Thay cho nút "Gửi thêm yêu thương" đã bỏ: khi thiệp đang mở thì tự bắn tim sau mỗi khoảng thời gian ngẫu nhiên.
  useEffect(() => {
    if (stage !== 'card_open') return;

    let burstTimer: ReturnType<typeof setTimeout>;
    const scheduleNextBurst = () => {
      const delay =
        AUTO_BURST_MIN_DELAY_MS + Math.random() * (AUTO_BURST_MAX_DELAY_MS - AUTO_BURST_MIN_DELAY_MS);
      burstTimer = setTimeout(() => {
        burstHearts(20 + Math.floor(Math.random() * 25));
        scheduleNextBurst();
      }, delay);
    };

    scheduleNextBurst();
    return () => clearTimeout(burstTimer);
  }, [stage, burstHearts]);

  // Support ?autostart=1 to test directly in open state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setStage('card_open');
    }
    return () => clearAllTimeouts();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden selection:bg-pink-200 selection:text-rose-900">
      {/* Background Ambience, Glowing Orbs, Falling Flower Petals */}
      <PetalBackground />

      {/* Floating Confetti Hearts Layer */}
      {burstItems.map((h) => (
        <span
          key={h.id}
          className="burst-heart text-2xl md:text-3xl select-none"
          style={{
            left: '50%',
            top: '50%',
            ['--dx' as string]: `${h.dx}px`,
            ['--dy' as string]: `${h.dy}px`,
            ['--rot' as string]: `${h.rot}deg`,
          }}
        >
          {h.char}
        </span>
      ))}

      {/* Top Navbar / Controls */}
      <header className="relative z-30 w-full max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-xs border border-rose-200">
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <span className="font-serif italic text-sm md:text-base font-semibold text-rose-900 tracking-wide">
            A little surprise for you
          </span>
        </div>

        {/* Music Player Control */}
        <button
          type="button"
          onClick={handleToggleMusic}
          aria-label={musicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
          data-testid="music-toggle-btn"
          data-music-toggle
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-xs border backdrop-blur-md cursor-pointer ${
            musicPlaying
              ? 'bg-rose-500 text-white border-rose-400 shadow-rose-200 hover:bg-rose-600'
              : 'bg-white/80 text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          {musicPlaying ? (
            <>
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>♫ Nhạc: Bật</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>♫ Nhạc: Tắt</span>
            </>
          )}
        </button>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-20 flex-1 w-full max-w-4xl mx-auto px-4 py-4 md:py-6 flex flex-col items-center justify-center min-h-[540px]">
        {/* Intro Heading (fades softly when card is open) */}
        <div
          className={`text-center max-w-lg mx-auto mb-4 md:mb-6 transition-all duration-700 ${
            stage === 'card_open'
              ? 'opacity-0 -translate-y-4 pointer-events-none absolute'
              : 'opacity-100 translate-y-0 relative'
          }`}
        >
          <div className="text-xs md:text-sm font-bold tracking-[0.22em] uppercase text-rose-600/90 mb-1.5">
            20 · 10 · A little surprise
          </div>
          <h1
            className="text-3xl md:text-5xl font-extrabold text-rose-900 tracking-tight leading-tight mb-2"
            style={{ fontFamily: "'Be Vietnam Pro', 'Playfair Display', system-ui, sans-serif" }}
          >
            Một món quà nhỏ <br className="hidden sm:inline" /> dành cho em
          </h1>
          <p className="text-rose-800/80 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Có một điều dễ thương tớ muốn gửi đến em hôm nay. <br />
            Chạm 2 lần vào hộp quà để mở nhé! 💗
          </p>
        </div>

        {/* 3D Gift Box Component */}
        <GiftBox3D stage={stage} onOpen={handleOpenGift} />

        {/* Emerged Greeting Card Component */}
        {stage === 'card_open' && (
          <div className="w-full flex items-center justify-center">
            <GreetingCard data={giftConfig.message} onReplay={handleReplay} />
          </div>
        )}

        {stage === 'card_open' && hasImages && (
          <button
            type="button"
            onClick={() =>
              document.getElementById(GALLERY_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            data-testid="scroll-to-gallery-btn"
            className="relative z-30 mt-4 flex flex-col items-center gap-0.5 text-xs md:text-sm font-semibold text-rose-700/90 hover:text-rose-900 transition-colors cursor-pointer"
          >
            <span>Cuộn xuống xem ảnh nhé</span>
            <ChevronsDown className="w-5 h-5 animate-bounce" />
          </button>
        )}
      </main>

      {stage === 'card_open' && hasImages && (
        <PhotoGallery id={GALLERY_SECTION_ID} images={giftConfig.images} />
      )}

      {/* Footer Info */}
      <footer className="relative z-20 py-3 text-center text-xs text-rose-800/60 font-medium">
        <span>Tạo bằng tình yêu & sự dịu dàng 🌷 Dành cho ngày 20/10</span>
      </footer>
    </div>
  );
}
