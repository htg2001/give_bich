import type { CardMessageData } from './components/GreetingCard';
import backgroundMusic from './sound/sound.mp3';
import photo1 from './img/1.jpg';
import photo2 from './img/2.jpg';
import photo3 from './img/3.jpg';
import photo4 from './img/4.jpg';
import photo5 from './img/5.jpg';

export type GiftImage = string | { src: string; caption?: string };

export interface GiftConfig {
  music?: string;
  images: GiftImage[];
  message: CardMessageData;
}

// Nhạc trong src/sound, ảnh trong src/img: import ở đầu file rồi dùng biến bên dưới; cũng nhận URL đầy đủ.
export const giftConfig: GiftConfig = {
  // Để trống thì dùng giai điệu hộp nhạc tự tạo bằng Web Audio.
  music: backgroundMusic,

  // Mảng rỗng thì không hiện phần ảnh và trang không cuộn xuống; muốn có chú thích thì ghi { src: photo1, caption: '...' }.
  images: [photo1, photo2, photo3, photo4, photo5],

  message: {
    occasion: 'Gửi em, nhân ngày 20/10',
    title: 'Chúc em luôn rực rỡ 🌷',
    paragraphs: [
      'Chúc em có một ngày 20/10 thật vui, nhận được thật nhiều yêu thương và luôn giữ nụ cười xinh xắn ấy nhé.',
      'Mong những điều dịu dàng sẽ tìm đến em, những ngày mệt mỏi sẽ qua nhanh, và mỗi ngày đều có ít nhất một lý do để em mỉm cười.',
    ],
    signature: 'Chúc em luôn vui vẻ và hạnh phúc 💗',
    recipient: 'Em',
  },
};
