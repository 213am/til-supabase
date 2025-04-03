# SEO

## 썸네일

- `/public` 폴더에 배치 ( thumbnail.png )

## 아이콘

- `/src/app` 폴더에 배치 ( favicon.ico )

## 메타데이터 설정

### 1. 기본 메타데이터 설정

- http://localhost:3000
- `src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: "Todo",
  description: "Todo Supabase",
  openGraph: {
    title: "Todo",
    description: "Todo Supabase",
    images: [{ url: "/thumbnail.png" }],
  },
};
```

### 2. 페이지별 메타데이터 설정

- `src/app/(with-side)/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: "Blog",
  description: "Blog Supabase",
  openGraph: {
    title: "Blog",
    description: "Blog Supabase",
    images: [{ url: "/thumbnail.png" }],
  },
};
```

### 3. 동적 페이지 메타데이터 설정

- Next 15 Github Deploy 부분 참조
  - https://github.com/213am/til-next-15/tree/06-deploy

## Vercel 배포

- https://vercel.com/213ams-projects-1e986e65
- 환경 변수 등록 주의
  - `.env.production`
  - SITE_URL 은 배포 후 주소로 변경

# 네이버 서치 어드바이저 등록하기

- `https://searchadvisor.naver.com`
- **웹 마스터 도구** 버튼 클릭 `https://searchadvisor.naver.com/console/board`
- `사이트 소유확인 > HTML 태그 복사` 로 이동

```html
<meta
  name="naver-site-verification"
  content="163c2b147c1eaf117e891539c047350490f8c728"
/>
```

- `src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: "Todo",
  description: "Todo Supabase",
  openGraph: {
    title: "Todo",
    description: "Todo Supabase",
    images: [{ url: "/thumbnail.png" }],
  },
  other: {
    "naver-site-verification": "163c2b147c1eaf117e891539c047350490f8c728",
  },
};
```
