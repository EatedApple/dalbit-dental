# Dalbit Dental LED Ads Template

달빛치과 KTX/지하철 전광판용 2693×505 광고 이미지를 자동 생성하는 템플릿입니다.

## 생성되는 파일

- `out/01-main.png`
- `out/02-ortho.png`
- `out/03-aesthetic.png`

## 사용 방법

```bash
cd led-ads
npm install
npx playwright install chromium
npm run render
```

## 파일 설명

- `data.js` : 광고 문구, 병원 정보, 이미지 경로
- `template.html` : 고정 레이아웃 템플릿
- `style.css` : 전광판용 디자인 스타일
- `render.js` : Playwright로 PNG 자동 생성

## 문구/사진 바꾸기

`data.js`의 `slides` 배열만 수정하면 됩니다.

## 영상으로 만들기

정지 이미지 3장을 만든 뒤 ffmpeg로 영상화할 수 있습니다.

```bash
ffmpeg \
  -loop 1 -t 5 -i out/01-main.png \
  -loop 1 -t 5 -i out/02-ortho.png \
  -loop 1 -t 5 -i out/03-aesthetic.png \
  -filter_complex "[0:v]scale=2693:505,setsar=1[v0];[1:v]scale=2693:505,setsar=1[v1];[2:v]scale=2693:505,setsar=1[v2];[v0][v1][v2]concat=n=3:v=1:a=0,format=yuv420p[v]" \
  -map "[v]" dalbit-led-15s.mp4
```
