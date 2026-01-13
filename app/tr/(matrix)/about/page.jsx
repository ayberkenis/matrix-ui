import { serverFetch } from "../../../../lib/matrixApi";
import VersionDisplay from "../../../../components/VersionDisplay";

export const metadata = {
  title: "Hakkında - Matrix",
  description: "Matrix simülasyonu hakkında",
};

export default async function AboutPage() {
  const version = await serverFetch("/version");
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          HAKKINDA
        </h1>
        
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 space-y-4">
          <p className="text-matrix-green-dim leading-relaxed">
            Matrix, sanal bir dünyada karmaşık sosyal, ekonomik ve çevresel dinamikleri
            modelleyen gelişmiş bir ajan tabanlı simülasyon sistemidir. Sistem, ajanların
            etkileşim kurduğu, çalıştığı, ticaret yaptığı ve çevrelerinde gezinirken bireysel
            ajanları takip eder.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            SİSTEM GENEL BAKIŞ
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Simülasyon gerçek zamanlı olarak çalışır ve ajanlar ihtiyaçlarına, hedeflerine ve
            çevresel koşullarına göre özerk kararlar verir. Bölgeler yiyecek, su ve enerji gibi
            kaynakları yönetirken, ajanlar iş ve ticaretten sosyal etkileşimlere ve çatışmalara
            kadar çeşitli faaliyetlerde bulunur.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            ÖZELLİKLER
          </h2>
          <ul className="list-disc list-inside text-matrix-green-dim space-y-2 ml-4">
            <li>Özerk karar verme ile gerçek zamanlı ajan simülasyonu</li>
            <li>Bölge tabanlı kaynak yönetimi ve ekonomi</li>
            <li>Etkinlik takibi ve canlı akış izleme</li>
            <li>WebSocket tabanlı gerçek zamanlı güncellemeler</li>
            <li>Matrix temalı kontrol arayüzü</li>
          </ul>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            TEKNOLOJİ
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Next.js 16, React ve modern web teknolojileri ile geliştirilmiştir. Backend, canlı
            veri akışı için RESTful API'ler ve WebSocket bağlantıları sağlayan Tensor tabanlı
            hesaplama ile Python üzerinde çalışır.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            ÇALIŞMA SÜRESİ & ERİŞİLEBİLİRLİK
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Simülasyon, sunucu faturaları ödendiği sürece arka planda sürekli çalışır.
            Durum kalıcılığını korumaya çalışıyoruz, ancak sonunda bir sıfırlama ihtiyacı olacak.
            Matrix gibi, onu yalnızca belirli sayıda yeniden yükleyebilirsiniz... yaklaşık 5 kez,
            kesin olmak gerekirse.
            <span className="text-matrix-green text-xs block mt-2 font-mono">
              "Kabul etmeye hazır olduğumuz hayatta kalma seviyeleri var."
            </span>
          </p>
          
          {version && (
            <>
              <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
                SİSTEM SÜRÜMÜ
              </h2>
              <VersionDisplay version={version} />
            </>
          )}
          
          <div className="mt-6 p-4 bg-matrix-dark border border-matrix-green border-opacity-20">
            <p className="text-matrix-green-dim text-xs font-mono leading-relaxed">
              <span className="text-matrix-green">[SİSTEM MESAJI]</span> Matrix seni buldu.
              Beyaz tavşanı takip et. Tık tık, Neo.
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
