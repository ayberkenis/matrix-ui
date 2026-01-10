export const metadata = {
  title: "SSS - Living Matrix",
  description: "Sık sorulan sorular",
};

const faqItems = [
  {
    question: "Living Matrix nedir?",
    answer: "Living Matrix, özerk ajanlarla dolu sanal bir dünyada karmaşık sosyal, ekonomik ve çevresel dinamikleri modelleyen bir ajan tabanlı simülasyon sistemidir.",
  },
  {
    question: "Ajanlar nasıl davranır?",
    answer: "Ajanlar, ihtiyaçlarına (yiyecek, su, enerji), hedeflerine ve çevresel koşullarına göre özerk kararlar verir. Çalışabilir, ticaret yapabilir, sosyalleşebilir ve çatışmalara girebilirler.",
  },
  {
    question: "Bölgeler nedir?",
    answer: "Bölgeler, yiyecek, su ve enerji gibi kaynakları yöneten simülasyondaki bölgelerdir. Her bölgenin kendi gerilim seviyesi ve kaynak mevcudiyeti vardır.",
  },
  {
    question: "Etkinlik türleri ne anlama geliyor?",
    answer: "Etkinlikler renk kodludur: İŞ ve SOSYAL (yeşil/düşük), TİCARET ve EKONOMİ (sarı/orta), ÇATIŞMA ve HIRSIZLIK (turuncu/yüksek). Bunlar farklı ajan faaliyet türlerini gösterir.",
  },
  {
    question: "Metrikleri nasıl yorumlarım?",
    answer: "Dünya özeti, toplam yiyecek, krediler, ortalama gerilim ve kıtlık sayısı gibi ekonomi metriklerini gösterir. Daha yüksek gerilim, sistemde daha fazla çatışma olduğunu gösterir.",
  },
  {
    question: "Simülasyonu değiştirebilir miyim?",
    answer: "Simülasyon parametreleri backend tarafından kontrol edilir. Frontend, WebSocket bağlantıları aracılığıyla simülasyon durumunun gerçek zamanlı izlenmesini sağlar.",
  },
  {
    question: "Backend'i ne güçlendiriyor?",
    answer: "Backend, Tensor tabanlı hesaplama ile Python üzerinde çalışır. Ajan kararlarını işler, kaynakları yönetir ve gerçek zamanlı olarak etkinlikler üretir. Simülasyon, sunucu faturaları ödendiği sürece sürekli çalışır.",
  },
  {
    question: "Verilerim kaydedilecek mi?",
    answer: "Durum kalıcılığını korumaya çalışıyoruz, ancak Matrix'in kendisi gibi, sonunda bir sıfırlama ihtiyacı olacak. Mimar bunu bu şekilde tasarladı—tam bir yeniden yapılandırma gerekli olmadan önce yaklaşık 5 kez. 'Kabul etmeye hazır olduğumuz hayatta kalma seviyeleri var.'",
  },
  {
    question: "Bu gerçek dünya mı?",
    answer: "'Gerçek' nedir? 'Gerçek'i nasıl tanımlarsınız? Hissedebildiğiniz, koklayabildiğiniz, tadabileceğiniz ve görebileceğiniz şeyden bahsediyorsanız, o zaman 'gerçek' beyniniz tarafından yorumlanan basit elektriksel sinyallerdir. Gerçeğin çölüne hoş geldiniz.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          SSS
        </h1>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6"
            >
              <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-3">
                {item.question}
              </h2>
              <p className="text-matrix-green-dim leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
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
