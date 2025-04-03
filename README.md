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

# 구글 로그인 후 Redirec 처리

- https://cloud.google.com/developers?hl=ko
- `콘솔`로 이동
- `프로젝트` 선택
- `API 및 서비스` > `OAuth 동의 화면` > `클라이언트` > `목록 중 해당 프로젝트` 선택
- 승인된 리디렉션 URI 항목에 추가 (`https://til-supabase.vercel.app`)

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

- `소유권 확인` 성공 시
- `웹마스터 도구 > 요약 > 검증 > robots.txt` 로 이동

## /pubilc/robots.txt 파일 생성

```txt
# *
User-agent: *
Allow: /

# Host
Host: https://til-supabase.vercel.app

# Sitemaps
Sitemap: https://til-supabase.vercel.app/sitemap.xml
```

## /public/sitemap.xml 파일 생성

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://blog-kakaobrain-devgreact.vercel.app/sitemap-0.xml</loc></sitemap>
</sitemapindex>
```

## /public/sitemap-0.xml 파일 생성

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
<url><loc>https://til-supabase.vercel.app/</loc><lastmod>2023-09-11T23:52:17.732Z</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>
<url><loc>https://til-supabase.vercel.app/basic/link</loc><lastmod>2023-09-11T23:52:17.732Z</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>
<url><loc>https://til-supabase.vercel.app/basic/sample01</loc><lastmod>2023-09-11T23:52:17.732Z</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>
</urlset>
```
