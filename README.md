# give_bich

Trang quà tặng 20/10: hộp quà 3D chạm 2 lần để mở, thiệp chúc, ảnh và nhạc nền.

## Chạy ở máy

```bash
npm install
npm run dev   # http://localhost:3000, thêm ?autostart=1 để vào thẳng thiệp
```

## Sửa nội dung

Tất cả nằm trong `src/gift.config.ts`:

- `message`: lời chúc trên thiệp.
- `images`: ảnh đặt trong `src/img/`, import ở đầu file rồi thêm vào mảng; mảng rỗng thì không hiện phần ảnh.
- `music`: nhạc nền đặt trong `src/sound/`; để trống thì dùng giai điệu hộp nhạc tự tạo.

## Deploy

Push lên nhánh `main` là GitHub Actions tự build và đưa lên GitHub Pages (Settings → Pages → Source: GitHub Actions).
