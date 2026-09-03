export const Footer = () => {
  return (
    <footer className="w-full border-t border-base-300 bg-base-100 py-4 px-6 text-xs text-base-content/60 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        &copy; {new Date().getFullYear()} <strong>Universitas Andalas</strong> — Sistem Informasi Kurikulum & Capaian Pembelajaran.
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <a href="#" className="hover:text-primary transition-colors">Bantuan</a>
        <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
        <a href="#" className="hover:text-primary transition-colors">v1.0.0</a>
      </div>
    </footer>
  );
};
