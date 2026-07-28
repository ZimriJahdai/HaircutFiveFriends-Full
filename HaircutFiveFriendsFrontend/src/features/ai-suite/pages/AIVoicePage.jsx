import NavbarClient from '../../client/components/NavbarClient.jsx';

export function AIVoicePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <NavbarClient />

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <header className="mb-6">
          <h1 className="font-['Bebas_Neue'] text-4xl tracking-wider text-white">Voz IA</h1>
          <p className="text-sm text-zinc-400 mt-1">Módulo integrado al frontend principal.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#111] p-6">
          <h2 className="text-xl font-semibold text-white">Estado actual</h2>
          <p className="text-sm text-zinc-400 mt-3 leading-6">
            Esta vista ya está unificada dentro del frontend principal. El siguiente paso es conectar aquí el flujo
            de audio en tiempo real (WebSocket + captura de micrófono) que hoy existe en el cliente IA separado.
          </p>
        </section>
      </main>
    </div>
  );
}
