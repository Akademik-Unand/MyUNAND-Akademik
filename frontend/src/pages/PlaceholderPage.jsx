import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Layers, Plus, Filter, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlaceholderPage = ({ title, group = 'Master Data', description }) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={description || `Modul ${title} pada ${group} SIAKAD Kurikulum`}
        breadcrumbs={[{ label: group }, { label: title }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Filter size={14} />
              <span>Filter Data</span>
            </Button>
            <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
              <Plus size={15} />
              <span>Tambah {title}</span>
            </Button>
          </div>
        }
      />

      <Card>
        <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-base-200 text-base-content/50 flex items-center justify-center mx-auto">
            <Layers size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-base-content">{title}</h3>
            <p className="text-xs text-base-content/50">Modul belum aktif.</p>
          </div>
          <div className="pt-1 flex items-center justify-center">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft size={14} /> Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
