# 🎓 Mühendislik öğrencileri için İnteraktif Akademik Planlayıcı & GPA Hesaplayıcı

## 🚀 Canlı Demo

Projeyi hemen dene: [İnteraktif Akademik Planlayıcı](https://fen1kks.github.io/Interaktif-Akademik-Planlayici/)

## 📝 Kısa Özet

Makine Mühendisliği öğrencileri için özel olarak geliştirilmiş; ders ön koşullarını görselleştiren, akademik rotanızı planlamanızı sağlayan ve gelecekteki not ortalamanızı simüle eden interaktif bir web aracı.

## 📥 Kurulum ve Çalıştırma

Proje artık **Vite + TypeScript** altyapısını kullanmaktadır. Geliştirme ortamını kurmak için:

1.  **Bağımlılıkları Yükle:**
    ```bash
    npm install
    ```

2.  **Geliştirme Sunucusunu Başlat:**
    ```bash
    npm run dev
    ```
    Tarayıcınızda (genellikle `http://localhost:5173`) projeyi görüntüleyebilirsiniz.

3.  **Production Build Al:**
    ```bash
    npm run build
    ```

## 🤝 Katkıda Bulunma

Yeni bir bölüm eklemek veya mevcut bölümleri geliştirmek ister misiniz? **[CONTRIBUTING.md](CONTRIBUTING.md)** dosyasında detaylı rehber bulabilirsiniz.

## ❓ Neden Bu Proje?

Ders seçim dönemlerinde hangi dersin hangisine bağlı olduğunu (prerequisite) takip etmek karmaşık olabiliyor. Excel tabloları arasında kaybolmak yerine, tüm müfredatı birbirine bağlı canlı bir ağaç yapısında görmek, öğrencilerin akademik yollarını çizmelerini kolaylaştırır.

## ✨ Öne Çıkan Özellikler

### 🎯 Temel Özellikler

- **🔗 İnteraktif Ön Koşul Ağacı:** Bir dersin üzerine geldiğinizde, o derse bağlı olan veya o dersin açtığı tüm dersleri dinamik oklarla görselleştirir.
- **🧮 Akıllı GPA Simülasyonu:** Geçmiş derslerinizi ve almayı planladığınız derslerin notlarını girerek kümülatif ortalamanızı (CGPA) anlık olarak hesaplayın.
- **🔒 Kilit Sistemi (Logic Lock):** Henüz ön koşulunu vermediğiniz bir dersi seçmenizi engelleyerek hatalı program yapma riskini ortadan kaldırır.
- **💾 LocalStorage Teknolojisi:** Üyelik gerektirmez! Tüm verileriniz sadece kendi tarayıcınızda saklanır ve sayfayı yenilediğinizde kaybolmaz.
- **🎨 Gelişmiş Tema Sistemi:** Göz yormayan "Karanlık Mod", ferah "Aydınlık Mod" ve özel "Rose" teması seçenekleriyle kişiselleştirilebilir deneyim.
- **🌍 Çoklu Dil Desteği:** Türkçe ve İngilizce dilleri arasında anında geçiş yapabilme imkanı. Tüm ders adları, arayüz metinleri ve uyarılar seçilen dile göre dinamik olarak güncellenir.

### 🎓 Ön Koşul Sistemi

- **⚡ Eş Koşul (Co-requisite) Desteği:** Laboratuvar ve teorik dersler gibi birlikte alınması gereken dersleri otomatik olarak tanır ve uyarır.
- **⚠️ Zayıf Ön Koşul (Weak Prerequisite):** Dersi geçmiş olmanız gerekmez; sadece almış olmanız (FF olsa bile) yeterlidir.
- **🔢 Sayısal Ön Koşul (Count Pattern):** "En az 5 adet ME3XX dersi" gibi esnek ön koşul kurallarını destekler.

### 📄 PDF Transkript Yükleme (YENİ!)

- **📂 Tek Tıkla İçe Aktarma:** Okul portalından (OBS) veya e-Devlet'ten indirdiğiniz PDF transkriptinizi sisteme yükleyerek tüm derslerinizi saniyeler içinde işleyin.
- **🔒 Gizlilik Odaklı:** Transkriptiniz **asla** bir sunucuya yüklenmez. Tüm işlem tarayıcınızda (Client-Side) gerçekleşir.
- **✨ Akıllı Eşleştirme:** Sistem, ders kodlarını ve notlarını otomatik olarak tanır, seçmeli dersleri ilgili havuzlardan bulup doğru slotlara yerleştirir.

### 📚 Seçmeli Ders Sistemi

- **🌐 500+ Serbest Seçmeli:** Üniversite genelinde sunulan tüm serbest seçmeli dersler tek havuzda.
- **🔧 Teknik Seçmeliler:** Bölümler arası ortak teknik seçmeli havuzu (ES310, MTH424, CSE480, vb.).
- **💡 Dinamik Kredi Sistemi:** Dersin kredisini (0, 2, 3, 4 vb.) kullanıcı seçebilir.
- **🎯 Akıllı Filtreleme:** Her bölüm kendi özel seçmeli havuzlarını kullanır, tekrar eden dersler otomatik filtrelenir.
- **📱 PWA Desteği:** iOS ve Android cihazlarda uygulamayı ana ekrana ekleyerek tam ekran deneyimi yaşayabilirsiniz.
- **🔔 Gelişmiş Bildirimler:** Tarayıcı uyarıları yerine modern, engelleyici olmayan "Toast" bildirimleri.

### 🏛️ Desteklenen Bölümler

- **Makine Mühendisliği (ME)** - Tam destek
- **Bilgisayar Mühendisliği (CSE)** - Tam destek
- **Elektrik-Elektronik Mühendisliği (EE)** - Tam destek
- **Kimya Mühendisliği (CHBE)** - Tam destek
- **Biyomedikal Mühendisliği (BME)** - Tam destek
- **Genetik ve Biyomühendislik (GBE)** - Tam destek
- **Endüstri Mühendisliği (ISE)** - Tam destek
- **Malzeme Bilimi ve Nanoteknoloji (MSN)** - Tam destek

## 🛠️ Kullanılan Teknolojiler

- **Vite** - Ultra hızlı frontend geliştirme aracı
- **TypeScript** - Tip güvenliği ve ölçeklenebilirlik
- **HTML5 & CSS3** - Modern HSL Renk Paleti, Flexbox/Grid Layout
- **SVG** - Dinamik Bezier Eğrileri ile Ok Çizimi
- **Modüler Mimari** - Ayrıştırılmış veri ve logic katmanları

## 🏗️ Veri Mimarisi

Proje, **`src/data/`** altında modüler bir yapı kullanır:

- **`src/data/departments/*.ts`** - Her bölümün özel müfredatı (ME, CSE vb.) **burada bulunur**.
- **`src/data/common.ts`** - Ortak havuzlar (İngilizce, Programlama, Teknik Seçmeliler)
- **`src/data/registry.ts`** - Bölüm kayıt sistemi
- **`src/i18n/*.ts`** - Dil ve çeviri dosyaları (Ders isimleri, arayüz metinleri)
- **`src/utils/logic.ts`** - Hesaplama ve kilit mantığı (Saf fonksiyonlar)
- **`src/utils/visuals.ts`** - Görselleştirme motoru
- **`src/utils/theme.ts`** - Tema yöneticisi
- **`src/utils/transcript-parser.ts`** - PDF İşleme motoru

## 🗺️ Gelecek Planları (Roadmap)

- **🔄 Çift Anadal (ÇAP) Sistemi:** İki farklı bölümün ders programını aynı anda görüntüleme ve çakışma kontrolü.


---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**
