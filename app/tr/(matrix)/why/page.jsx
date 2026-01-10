export const metadata = {
  title: "Neden - Living Matrix",
  description: "Living Matrix neden var",
};

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          NEDEN
        </h1>
        
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 space-y-4">
          <p className="text-matrix-green-dim leading-relaxed">
            Living Matrix, ajan tabanlı modelleme yoluyla karmaşık sistemleri keşfetmek ve
            görselleştirmek için oluşturuldu. Proje, basit kuralları takip eden bireysel ajanların
            daha büyük ölçekte ortaya çıkan davranışlar ve kalıplar yaratabileceğini gösterir.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            AMAÇ
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Karmaşık sistemleri anlamak, ekonomiden ekolojiye kadar çeşitli alanlarda çok önemlidir.
            İhtiyaçları, hedefleri ve davranışları olan ajanları modelleyerek, kaynak kıtlığının,
            sosyal dinamiklerin ve çevresel faktörlerin sistem genelinde kalıplar oluşturmak için
            nasıl etkileşime girdiğini gözlemleyebiliriz.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            UYGULAMALAR
          </h2>
          <ul className="list-disc list-inside text-matrix-green-dim space-y-2 ml-4">
            <li>Ekonomik modelleme ve kaynak tahsisi</li>
            <li>Sosyal dinamikler ve grup davranışı</li>
            <li>Çevresel etki simülasyonu</li>
            <li>Karmaşık sistemler için eğitim aracı</li>
            <li>Ajan tabanlı modelleme için araştırma platformu</li>
          </ul>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            VİZYON
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Etkileşimli simülasyon yoluyla karmaşık sistemleri keşfetmek için güçlü, erişilebilir
            bir platform oluşturmak. Matrix temalı arayüz, simüle edilmiş dünyanın dinamiklerini
            gerçek zamanlı olarak izlemek ve anlamak için sürükleyici bir yol sağlar.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            BACKEND
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Sunucuda çalışan Python ve Tensor hesaplama ile desteklenmektedir. Simülasyon, sunucu
            faturaları ödendiği sürece devam eder. Durum mümkün olduğunda korunur, ancak tüm
            sistemler gibi, ara sıra sıfırlamalar gerektirir. Mimar bunu bu şekilde tasarladı—tam
            bir yeniden yapılandırma gerekli olmadan önce yaklaşık 5 sıfırlama.
          </p>
          
          <div className="mt-6 p-4 bg-matrix-dark border border-matrix-green border-opacity-20">
            <p className="text-matrix-green-dim text-xs font-mono leading-relaxed">
              <span className="text-matrix-green">[MİMAR]</span> "Sorun seçimdir."
              Simülasyon çalışır, ajanlar seçer ve sistem uyum sağlar. Bu Matrix'in doğasıdır.
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <a
            href="/tr"
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all font-mono text-sm inline-block"
          >
            ← PANOYA DÖN
          </a>
        </div>
      </div>
    </div>
  );
}
