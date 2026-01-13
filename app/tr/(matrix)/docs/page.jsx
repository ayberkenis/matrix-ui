export const metadata = {
  title: "Dökümantasyon - Matrix",
  description: "Matrix API dökümantasyonu",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          DÖKÜMANTASYON
        </h1>
        
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              API UÇ NOKTALARI
            </h2>
            <div className="space-y-4 text-matrix-green-dim font-mono text-sm">
              <div>
                <code className="text-matrix-green">GET /health</code>
                <p className="ml-4 mt-1">Sağlık kontrolü uç noktası</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /state</code>
                <p className="ml-4 mt-1">Mevcut dünya durumunu al (tur, gün, zaman, hava, ekonomi)</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /agents</code>
                <p className="ml-4 mt-1">Tüm ajanların listesini al</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /districts</code>
                <p className="ml-4 mt-1">Kaynaklarla tüm bölgelerin listesini al</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /events</code>
                <p className="ml-4 mt-1">Son etkinlikleri al ({"{ events: [...], count: N }"} döndürür)</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /version</code>
                <p className="ml-4 mt-1">Sistem sürüm bilgilerini al (matrix_version, created_at, last_reset_at, reset_count, initialized)</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /world/causality</code>
                <p className="ml-4 mt-1">Neden-sonuç ilişkilerini gösteren nedensellik kayıtlarını al ({"{ records: [...], total_records: N, returned: N }"} döndürür)</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /world/emotions</code>
                <p className="ml-4 mt-1">Duygusal durum özeti ve son izleri al ({"{ summary: {...}, recent_traces: [...], total_traces: N }"} döndürür)</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /world/rules</code>
                <p className="ml-4 mt-1">Dünya kurallarını al ({"{ rules: [...], total_rules: N, returned: N }"} döndürür)</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              WEBSOCKET
            </h2>
            <div className="space-y-2 text-matrix-green-dim font-mono text-sm">
              <p>
                <code className="text-matrix-green">ws://localhost:8000/ws</code>
              </p>
              <p className="ml-4 mt-2">
                Mesaj formatı: {"{ type: 'state' | 'event' | 'agents' | 'districts' | 'metrics', payload: {...} }"}
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              VERİ YAPILARI
            </h2>
            <div className="space-y-3 text-matrix-green-dim text-sm">
              <div>
                <code className="text-matrix-green">State:</code>
                <pre className="ml-4 mt-1 text-xs bg-matrix-dark p-2 border border-matrix-green border-opacity-20 overflow-x-auto">
{`{
  turn: number,
  day: number,
  time: string,
  weather: string,
  economy: {
    total_food: number,
    total_credits: number,
    average_tension: number,
    scarcity_count: number,
    district_count: number
  },
  timestamp: string
}`}
                </pre>
              </div>
              <div>
                <code className="text-matrix-green">Event:</code>
                <pre className="ml-4 mt-1 text-xs bg-matrix-dark p-2 border border-matrix-green border-opacity-20 overflow-x-auto">
{`{
  agent_id: string,
  description: string,
  type: 'work' | 'social' | 'trade' | 'conflict' | 'theft' | 'economy' | null
}`}
                </pre>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              ORTAM DEĞİŞKENLERİ
            </h2>
            <div className="space-y-2 text-matrix-green-dim font-mono text-sm">
              <p><code className="text-matrix-green">NEXT_PUBLIC_MATRIX_API_URL</code> - API temel URL</p>
              <p><code className="text-matrix-green">NEXT_PUBLIC_MATRIX_WS_URL</code> - WebSocket URL</p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              BACKEND MİMARİSİ
            </h2>
            <div className="space-y-3 text-matrix-green-dim text-sm">
              <p>
                Backend, Tensor tabanlı hesaplama ile Python tarafından desteklenmektedir. Simülasyon
                motoru ajan kararlarını işler, bölge kaynaklarını yönetir ve gerçek zamanlı olarak
                etkinlikler üretir.
              </p>
              <p>
                <span className="text-matrix-green font-bold">Çalışma Süresi:</span> Simülasyon
                sunucu faturaları ödendiği sürece sürekli çalışır. Durum kalıcılığı denenir, ancak
                sıfırlamalar gerekli olacak—Mimar tarafından tasarlandığı gibi tam bir yeniden
                yapılandırma öncesinde yaklaşık 5 kez.
              </p>
              <div className="mt-4 p-3 bg-matrix-dark border border-matrix-green border-opacity-20">
                <p className="text-xs font-mono text-matrix-green-dim">
                  <span className="text-matrix-green">[SİSTEM]</span> "Matrix bir sistemdir,
                  Neo. Bu sistem düşmanımızdır. Ama içerideyken, etrafına bakarsın, ne
                  görürsün? İşadamları, öğretmenler, avukatlar, marangozlar. Kurtarmaya çalıştığımız
                  insanların zihinleri."
                </p>
              </div>
            </div>
          </section>
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
