# Nexora NFT Platform - Güvenlik Rehberi

Bu dokümantasyon Nexora NFT platformunda implement edilen güvenlik özelliklerini açıklar.

## 🔒 Güvenlik Özellikleri

### 1. Input Sanitization (Girdi Temizleme)

**Dosya:** `src/lib/security.ts`

```typescript
import { sanitizeText, sanitizeHtml, sanitizeEmail } from '@/lib/security';

// Metin temizleme
const cleanText = sanitizeText(userInput);

// HTML temizleme (XSS koruması)
const cleanHtml = sanitizeHtml(userInput);

// Email validasyonu
const cleanEmail = sanitizeEmail(userInput);
```

**Özellikler:**
- XSS saldırılarına karşı koruma
- HTML tag'lerinin temizlenmesi
- JavaScript kod enjeksiyonunun engellenmesi
- Email format validasyonu

### 2. Rate Limiting (Hız Sınırlama)

**Dosya:** `src/middleware/rateLimiter.ts`

```typescript
import { apiRateLimiter, authRateLimiter, uploadRateLimiter } from '@/middleware/rateLimiter';

// API endpoint'leri için
export const POST = withRateLimit(handler, apiRateLimiter);

// Auth endpoint'leri için (daha sıkı limit)
export const POST = withRateLimit(handler, authRateLimiter);

// Upload endpoint'leri için
export const POST = withRateLimit(handler, uploadRateLimiter);
```

**Limitler:**
- **API:** 15 dakikada 100 istek
- **Auth:** 15 dakikada 5 istek
- **Upload:** 1 saatte 10 upload
- **NFT Creation:** 1 saatte 20 NFT

### 3. CSRF Koruması

**Dosya:** `src/middleware/csrf.ts`

```typescript
import { csrfProtection, generateCSRFResponse } from '@/middleware/csrf';

// CSRF koruması middleware
export const POST = withCSRFProtection(handler);

// CSRF token endpoint
export async function GET(request: NextRequest) {
  return generateCSRFResponse(request);
}
```

**Client-side kullanım:**
```typescript
import { apiClient } from '@/lib/clientSecurity';

// Otomatik CSRF token yönetimi
const response = await apiClient.post('/api/collections', data);
```

### 4. File Upload Güvenliği

**Dosya:** `src/middleware/fileUpload.ts`

```typescript
import { validateFileUploadSecurity, FILE_UPLOAD_CONFIG } from '@/lib/security';

// Dosya validasyonu
const validation = validateFileUploadSecurity(file, FILE_UPLOAD_CONFIG.IMAGES);

if (!validation.valid) {
  throw new Error(validation.error);
}
```

**Güvenlik kontrolleri:**
- Dosya boyutu sınırları
- MIME type kontrolü
- Dosya uzantısı kontrolü
- Malware tarama (placeholder)
- Directory traversal koruması

### 5. Güvenli API Routes

**Dosya:** `src/lib/apiHelpers.ts`

```typescript
import { secureAPIHandler, successResponse, errorResponse } from '@/lib/apiHelpers';

// Güvenli API handler
export const POST = secureAPIHandler(async (request, context) => {
  // context.user ve context.userId otomatik olarak sağlanır
  // CSRF koruması otomatik olarak uygulanır
  
  return successResponse(data, 'Success message');
});
```

### 6. Client-side Güvenlik

**Dosya:** `src/lib/clientSecurity.ts`

```typescript
import { 
  apiClient, 
  fileUpload, 
  validateCollectionForm,
  FormValidator 
} from '@/lib/clientSecurity';

// Form validasyonu
const validation = validateCollectionForm(formData);
if (!validation.valid) {
  console.error(validation.errors);
}

// Güvenli API çağrıları
const response = await apiClient.post('/api/collections', data);

// Güvenli file upload
const result = await fileUpload.uploadFile(file, 'collection-image');
```

## 🛡️ Güvenlik Headers

Middleware otomatik olarak aşağıdaki güvenlik header'larını ekler:

```typescript
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
};
```

## 📁 Dosya Yapısı

```
src/
├── lib/
│   ├── security.ts          # Güvenlik utilities
│   ├── apiHelpers.ts        # API helper fonksiyonları
│   └── clientSecurity.ts    # Client-side güvenlik
├── middleware/
│   ├── rateLimiter.ts       # Rate limiting
│   ├── csrf.ts             # CSRF koruması
│   ├── fileUpload.ts       # File upload güvenliği
│   └── middleware.ts       # Ana middleware
└── app/api/
    ├── csrf/route.ts       # CSRF token endpoint
    ├── collections/route.ts # Güvenli koleksiyon API
    ├── nfts/route.ts       # Güvenli NFT API
    └── upload/route.ts     # Güvenli upload API
```

## 🚀 Kullanım Örnekleri

### 1. Güvenli Koleksiyon Oluşturma

```typescript
// Client-side
const validation = validateCollectionForm({
  name: 'My Collection',
  description: 'A great collection',
  mintPrice: '0.1',
  royalty: '5'
});

if (validation.valid) {
  const response = await apiClient.post('/api/collections', data);
}
```

### 2. Güvenli File Upload

```typescript
// Client-side
const result = await fileUpload.uploadFile(file, 'collection-image');
if (result.success) {
  console.log('Upload successful:', result.data.filePath);
}
```

### 3. Güvenli NFT Oluşturma

```typescript
// Server-side
export const POST = secureAPIHandler(async (request, context) => {
  const body = await request.json();
  const validation = validateNFTRequest(body);
  
  if (!validation.valid) {
    return errorResponse('Validation failed', 400, validation.errors?.join(', '));
  }
  
  // NFT oluşturma işlemi...
  return successResponse(nft, 'NFT created successfully');
});
```

## 🔧 Konfigürasyon

### Environment Variables

```env
# Güvenlik için gerekli environment variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Production için
NODE_ENV=production
```

### Rate Limiting Konfigürasyonu

```typescript
// src/lib/security.ts
export const RATE_LIMITS = {
  API: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // 100 istek
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // 5 istek
  },
  // ... diğer limitler
};
```

## 🧪 Test Etme

### Güvenlik Testleri

```bash
# Rate limiting testi
for i in {1..10}; do curl -X POST http://localhost:3000/api/auth/signin; done

# CSRF testi
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}' # CSRF token olmadan

# File upload testi
curl -X POST http://localhost:3000/api/upload \
  -F "file=@malicious.exe" # Kötü amaçlı dosya
```

## 📊 Monitoring

### Güvenlik İstatistikleri

```typescript
import { getRateLimitStats, getCSRFStats } from '@/middleware/rateLimiter';

// Rate limiting istatistikleri
const rateLimitStats = getRateLimitStats();
console.log('Active rate limit entries:', rateLimitStats.activeEntries);

// CSRF istatistikleri
const csrfStats = getCSRFStats();
console.log('Active CSRF tokens:', csrfStats.activeTokens);
```

## 🚨 Güvenlik Uyarıları

1. **Production'da Redis kullanın:** Rate limiting için in-memory storage production için uygun değil
2. **HTTPS zorunlu:** Production'da mutlaka HTTPS kullanın
3. **Environment variables:** Hassas bilgileri environment variables'da saklayın
4. **Regular updates:** Güvenlik paketlerini düzenli olarak güncelleyin
5. **Logging:** Güvenlik olaylarını loglayın ve izleyin

## 🔄 Güncellemeler

Bu güvenlik sistemi sürekli olarak güncellenmelidir:

- [ ] Redis entegrasyonu
- [ ] Advanced malware scanning
- [ ] Audit logging
- [ ] Penetration testing
- [ ] Security headers optimization

## 📞 Destek

Güvenlik ile ilgili sorularınız için:
- GitHub Issues kullanın
- Security advisories için email gönderin
- Documentation PR'ları açın

---

**Not:** Bu güvenlik sistemi temel koruma sağlar. Production ortamında ek güvenlik önlemleri alınması önerilir.
