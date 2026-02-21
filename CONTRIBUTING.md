# 🤝 Katkıda Bulunma Rehberi

Interaktif Akademik Planlayıcı projesine katkıda bulunmak istediğiniz için teşekkürler! 🎉

Bu proje **Vite** ve **TypeScript** altyapısını kullanmaktadır. İster kod geliştirmesi yapın, ister yeni bir bölüm müfredatı ekleyin, bu rehber size yardımcı olacaktır.

## 📋 İçindekiler

1. [🚀 Kurulum ve Geliştirme Ortamı](#-kurulum-ve-geliştirme-ortamı)
2. [🏗️ Proje Yapısı](#-proje-yapısı)
3. [🎓 Yeni Bölüm Ekleme](#-yeni-bölüm-ekleme)
4. [📊 Veri Yapısı ve Kurallar](#-veri-yapısı-ve-kurallar)
5. [📚 Seçmeli Havuzları](#-seçmeli-havuzları)
6. [🌍 Çoklu Dil Desteği (i18n)](#-çoklu-dil-desteği-i18n)
7. [🧪 Test Etme ve Gönderme](#-test-etme-ve-gönderme)

---

## 🚀 Kurulum ve Geliştirme Ortamı

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
- **Node.js** (Sürüm 18 veya üzeri önerilir)
- **npm** (Node.js ile birlikte gelir)

### Adım Adım Kurulum

1. **Projeyi Klonlayın:**
   ```bash
   git clone https://github.com/fen1kks/Interaktif-Akademik-Planlayici .
   ```
2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```
3. **Geliştirme Sunucusunu Başlatın:** Kodlamaya başlamak için bu komutu çalıştırın. Tarayıcınızda otomatik olarak açılacaktır (Genellikle `http://localhost:5173`).
   ```bash
   npm run dev
   ```

---

## 🏗️ Proje Yapısı

Koda katkıda bulunmadan önce proje mimarisini anlamak faydalı olacaktır:

| Dizin / Dosya | Açıklama |
| --- | --- |
| `src/main.ts` | Uygulama giriş noktası ve başlatma |
| `src/types.ts` | Ortak tip tanımları (`Course`, `Department`, `CourseOption`) |
| `src/core/` | Çekirdek modüller: durum yönetimi (`state.ts`), DOM renderlama (`render.ts`), bölüm yükleme (`department.ts`) |
| `src/features/` | Özellik modülleri: ders kartı etkileşimi, vurgulama, simülasyon, transkript, sıfırlama, zoom |
| `src/utils/` | Yardımcı fonksiyonlar: hesaplama mantığı, görselleştirme motoru, tema, PDF ayrıştırma |
| `src/data/` | Veri katmanı: bölüm müfredatları, ortak havuzlar, serbest seçmeliler |
| `src/data/departments/` | Her bölümün özel müfredatı (ME, CSE, EE, CHBE vb.) |
| `src/data/common.ts` | Ortak havuzlar (İngilizce, Programlama, Teknik Seçmeliler) |
| `src/data/free-electives.ts` | Serbest seçmeli havuzu (500+ ders) |
| `src/data/registry.ts` | Bölüm kayıt sistemi |
| `src/i18n/` | Dil ve çeviri dosyaları |
| `src/assets/styles/` | CSS dosyaları (`style.css`, `theme.css`) |

---

## 🎓 Yeni Bölüm Ekleme

### Adım 1: Bölüm Dosyası Oluşturma

`src/data/departments/` klasörüne yeni bir `.ts` dosyası ekleyin. Dosya adı bölüm kodu olmalıdır (örn: `me.ts` için Makine Mühendisliği).

**Örnek Şablon (`src/data/departments/me.ts`):**

```typescript
import { Department, CourseOption } from '../../types';
import { 
    englishPool, commonTechnicalElectives 
} from '../common';
import { freeElectives } from '../free-electives';

// 1. Bölüme özel seçmeli havuzlarını tanımlayın (isteğe bağlı)
const meRexxPool3: CourseOption[] = [
  { id: "ME301", name: "Kısa Ders Adı", credits: 3 },
  { id: "ME302", name: "Başka Ders", credits: 3 },
].sort((a, b) => a.id.localeCompare(b.id));

// 2. Bölümü export edin
export const ME: Department = {
  name: "Mechanical Engineering",
  curriculum: [
    // Derslerinizi buraya ekleyin (aşağıda detaylı açıklama var)
  ],
};
```

### Adım 2: Müfredatı Tanımlama

Her ders için şu formatı kullanın:

```typescript
{
    id: "MATH131",         // Ders kodu (benzersiz olmalı)
    name: "Calculus I",    // Ders adı (kısa ve ingilizce, max 20 karakter önerilir)
    credits: 4,            // Kredi sayısı (veya [3, 4, 2] gibi array)
    prereqs: ["MATH101"],  // Ön koşul dersleri (array)
    coreqs: ["PHYS101"],   // Eş koşul dersleri (isteğe bağlı)
    term: 1,               // Dönem numarası (1-8 arası, 9 = ekstra)
    options: englishPool   // Seçmeli havuzu (isteğe bağlı)
}
```

### Adım 3: Bölümü Kaydetme

Yeni dosyanızı `src/data/registry.ts` dosyasına ekleyin:

```typescript
import { ME } from './departments/me';
// ... diğer importlar

export const departments: DepartmentRegistry = {
    ME,
    // ... diğer bölümler
};
```

---

## 📊 Veri Yapısı Açıklaması

Tüm veriler `src/types.ts` dosyasındaki `Course`, `Department` ve `CourseOption` arayüzlerine uygun olmalıdır.

### `Course` — Zorunlu Alanlar

| Alan      | Tip          | Açıklama                                                  |
| --------- | ------------ | --------------------------------------------------------- |
| `id`      | String       | Benzersiz ders kodu (örn: "MATH131")                      |
| `name`    | String       | Ders adı (kısa ve öz)                                     |
| `credits` | Number/Array | Kredi sayısı (3, 4) veya değişken krediler için `[0, 2, 3, 4]` gibi array. |
| `prereqs` | Array        | Ön koşul ders kodları listesi                             |
| `term`    | Number       | Dönem numarası (1-8 normal, 9 ekstra)                     |

### `Course` — İsteğe Bağlı Alanlar

| Alan      | Tip   | Açıklama                                  |
| --------- | ----- | ----------------------------------------- |
| `coreqs`  | Array | Eş koşul dersleri (aynı dönemde alınmalı) |
| `options` | Array | Seçmeli ders havuzu referansı             |

### `CourseOption` — Seçmeli Ders Seçenekleri

Seçmeli havuzlardaki her bir ders seçeneği `CourseOption` tipindedir:

| Alan      | Tip          | Zorunlu | Açıklama                                         |
| --------- | ------------ | ------- | ------------------------------------------------ |
| `id`      | String       | ✅      | Ders kodu (örn: "ME301")                         |
| `name`    | String       | ✅      | Ders adı                                         |
| `credits` | Number/Array | ❌      | Kredi sayısı (varsayılan: üst ders kredisi)      |
| `prereqs` | Array        | ❌      | Bu seçeneğe özel ön koşullar (bağımsız kontrol)  |

> [!TIP]
> `CourseOption` içindeki `prereqs` sayesinde, bir seçmeli havuzundaki her bir ders seçeneği kendi ön koşullarına sahip olabilir. Havuzdan seçim yapılırken ön koşul uyumu dinamik olarak kontrol edilir.

---

## 🔐 Ön Koşul Türleri

### 1. Basit Ön Koşul

Dersi geçmiş olmanız gerekir (DD veya üstü).

```typescript
prereqs: ["MATH131", "PHYS101"];
```

### 2. Zayıf Ön Koşul (Weak Prerequisite)

Dersi almış olmanız yeterlidir (FF bile olsa). Ders kodunun sonuna `!` ekleyin.

```typescript
prereqs: ["CHEM101!"]; // CHEM101'i almış olmak yeterli, geçmek şart değil
```

### 3. Eş Koşul (Co-requisite)

Aynı dönemde alınması gereken dersler.

```typescript
{
    id: "PHYS102",
    // ...
    coreqs: ["PHYS103"]  // PHYS103 ile birlikte alınmalı
}
```

### 4. Sayısal Ön Koşul (Count Pattern)

"En az X adet YYY kodlu ders" gibi esnek kurallar.

```typescript
prereqs: [
  "ME211",
  {
    type: "count_pattern",
    pattern: "^ME3", // ME3 ile başlayan dersler
    exclude: ["ME363"], // Hariç tutulanlar
    minCount: 5, // En az 5 adet
    message: "ME3XX", // Kullanıcıya gösterilecek mesaj
  },
];
```

### 5. Seçmeli Ön Koşulları (Option Prerequisites)

Seçmeli havuzundaki bireysel ders seçeneklerine özel ön koşul tanımlama:

```typescript
const meRexxPool4: CourseOption[] = [
  { id: "ME450", name: "Advanced Dynamics", credits: 3, prereqs: ["ME301"] },
  { id: "ME460", name: "Robotics", credits: 3, prereqs: ["ME301", "EE101"] },
  { id: "ME470", name: "CFD", credits: 3 }, // Ön koşulsuz
];
```

---

## 📚 Seçmeli Havuzları

### Mevcut Ortak Havuzlar (`src/data/common.ts`)

Projenin merkezi havuz sistemi sayesinde, bu havuzları import ederek kullanabilirsiniz:

```typescript
import { englishPool, programmingPool, commonTechnicalElectives } from '../common';
import { freeElectives } from '../free-electives';

// İngilizce Seçmelileri (REXX1)
options: englishPool

// Programlama Seçmelileri (REXX3)
options: programmingPool

// Teknik Seçmeliler
options: commonTechnicalElectives

// Serbest Seçmeliler
options: freeElectives
```

### Ortak Havuzdan Miras Alma

Teknik seçmeliler için ortak havuzu kullanıp, bölüme özel dersleri ekleyin:

```typescript
const ieTechnicalElectives: CourseOption[] = [
  // Bölüme özel dersler
  { id: "IE450", name: "Simulation", credits: 3 },
  
  // Ortak havuzdan miras al (filtersiz)
  ...commonTechnicalElectives
].sort((a, b) => a.id.localeCompare(b.id)); // Alfabetik sıralama şart
```

---

## 🌍 Çoklu Dil Desteği (i18n)

Proje Türkçe ve İngilizce dil desteği sunmaktadır. Yeni bir bölüm eklerken ilgili çevirileri de eklemeniz gerekir.

### 1. Bölüm İsimleri (`src/i18n/ui.ts`)

Bölüm kodunun ve tam adının Türkçe karşılığını `src/i18n/ui.ts` dosyasındaki `departmentNames` objesine ekleyin:

```typescript
export const departmentNames: Record<string, string> = {
  "ME": "Makine Mühendisliği",
  // ... diğer bölümler
};
```

### 2. Ders Çevirileri (`src/i18n/courses/departments.ts`)

Bölümünüze özel derslerin Türkçe karşılıklarını `src/i18n/courses/departments.ts` dosyasına ekleyin. Eğer İngilizce isim ile Türkçe isim aynıysa (örn: Calculus) eklemenize gerek yoktur.

Ayrıca bölümünüze özel seçmeli havuz isimleri (REXX) varsa, onları da buraya eklemelisiniz.

```typescript
export const deptCourseNames: Record<string, string> = {
  "ME101": "Makine Müh. Giriş",
  "ME352": "Sistem Dinamiği",
  
  // Bölüme özel havuzlar
  "REXX3": "Prog. Seçmeli",
  "REXX4": "Elektronik Seçmeli"
};
```

### 3. Ortak ve Serbest Seçmeli Çevirileri

Ortak dersler ve serbest seçmeliler için ayrı dosyalar bulunur:

- **`src/i18n/courses/common.ts`** — Ortak ders çevirileri (İngilizce, Programlama havuzları vb.)
- **`src/i18n/courses/free.ts`** — Serbest seçmeli ders çevirileri

---

## 🧪 Test Etme

### 1. TypeScript Kontrolü

Verilerinizde hata olup olmadığını görmek için projeyi derleyin:

```bash
npm run build
```

Hata almazsanız her şey yolunda demektir.

### 2. Canlı Önizleme
Değişikliklerinizi tarayıcıda anlık olarak görmek ve test etmek için sunucuyu başlatın:
```bash
npm run dev
```
Tarayıcıda şunları kontrol edin:
- Eklediğiniz bölüm listede çıkıyor mu?
- Dersler doğru dönemlerde mi?
- Okların ve kilitlerin doğru çalışıyor mu?
- Ders vurgulamaları (highlight/dim) beklendiği gibi mi?
- Simülasyon modu doğru hesaplama yapıyor mu?

---

## 📝 Commit Mesajı Formatı

Değişikliklerinizi commit ederken şu formatı kullanın:

```bash
git commit -m "feat: add Mechanical Engineering (ME) department

- Added ME curriculum with 8 terms
- Created meRexxPool3, meRexxPool4 elective pools
- Integrated with commonTechnicalElectives
- Verified types pass"
```

**Katkılarınız için teşekkürler! 🎉**
