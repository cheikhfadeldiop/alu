import { PageContainer } from "@/components/layout/PageContainer";

export default function CommitmentsPage() {
    return (
        <PageContainer>
            <div className="py-12 md:py-24 crtv-page-enter">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-20 space-y-4">
                        <div className="text-accent font-black tracking-widest uppercase text-sm">Valeurs & Responsabilité</div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            Nos <span className="text-accent">Engagements</span>
                        </h1>
                    </div>

                    {/* Commitments list */}
                    <div className="space-y-12">
                        {[
                            { title: "Qualité de l'Info", desc: "Une information vérifiée, neutre et au service du citoyen camerounais.", color: "bg-flag-green" },
                            { title: "Cultures & Diversité", desc: "Promouvoir la richesse culturelle de nos 10 régions dans toutes nos productions.", color: "bg-flag-red" },
                            { title: "Innovation Technologique", desc: "Moderniser nos infrastructures pour une diffusion haute définition accessible partout.", color: "bg-flag-yellow" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-8 items-start group">
                                <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-2xl ${item.color} shadow-lg group-hover:rotate-12 transition-transform`}>
                                    0{i + 1}
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold tracking-tight">{item.title}</h2>
                                    <p className="text-xl text-muted leading-relaxed max-w-3xl">
                                        {item.desc}
                                    </p>
                                    <div className="h-[1px] w-full bg-border" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom graphic */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(idx => (
                            <div key={idx} className="aspect-square bg-surface/50 rounded-3xl border border-border flex items-center justify-center p-8 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-crosshair">
                                <div className="text-center">
                                    <div className="text-accent font-black text-xs uppercase tracking-widest mb-2">Pilier</div>
                                    <div className="font-bold text-foreground">Axe {idx}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
