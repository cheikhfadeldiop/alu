import { PageContainer } from "@/components/layout/PageContainer";
import { SITE_CONFIG } from "@/constants/site-config";

export default function AdvertisingPage() {
    return (
        <PageContainer>
            <div className="py-12 md:py-24 crtv-page-enter">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                        <div className="flex-1 space-y-6">
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">
                                <span className="text-foreground">Boostez votre</span><br />
                                <span className="text-accent underline decoration-8 underline-offset-10">Visibilité</span>
                            </h1>
                            <p className="text-xl text-muted leading-relaxed">
                                Bénéficiez de la puissance du réseau CRTV pour atteindre des millions de téléspectateurs et d'internautes.
                            </p>
                        </div>
                        <div className="flex-1">
                            <div className="relative aspect-square w-full max-w-md mx-auto">
                                <div className="absolute inset-0 bg-accent rounded-3xl rotate-6 opacity-10 animate-pulse" />
                                <div className="absolute inset-0 bg-surface rounded-3xl border-2 border-accent/20 flex items-center justify-center p-12 text-center">
                                    <div className="space-y-4">
                                        <div className="text-6xl font-black text-accent">+10M</div>
                                        <div className="text-sm font-bold uppercase tracking-widest text-muted">Audience Potentielle</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ad Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Publicité TV", desc: "Spots publicitaires sur CRTV, CRTV News et CRTV Sport.", icon: "📺" },
                            { title: "Radio FM", desc: "Campagnes audio sur le Poste National et nos stations régionales.", icon: "📻" },
                            { title: "Digital & Web", desc: "Bannières et contenu sponsorisé sur nos plateformes web et mobiles.", icon: "🌐" }
                        ].map((opt, i) => (
                            <div key={i} className="group p-10 bg-surface/30 backdrop-blur-sm rounded-[2.5rem] border border-border hover:border-accent transition-all hover:-translate-y-2">
                                <div className="text-4xl mb-6">{opt.icon}</div>
                                <h3 className="text-2xl font-bold mb-4">{opt.title}</h3>
                                <p className="text-muted leading-relaxed">{opt.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-20 p-12 bg-foreground text-background rounded-[3rem] text-center space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px]" />
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase">Prêt à collaborer ?</h2>
                        <div className="flex flex-col md:flex-row justify-center gap-6">
                            <a href={`mailto:${SITE_CONFIG.contact.email}`} className="px-10 py-4 bg-accent text-white font-bold rounded-full hover:scale-105 transition-transform">
                                Nous contacter
                            </a>
                            <a href={`tel:${SITE_CONFIG.contact.phones[0]}`} className="px-10 py-4 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all">
                                {SITE_CONFIG.contact.phones[0]}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
