import { packages } from '@/data/catalog'
import { CartBar, PackageCard } from '../components/CatalogCards'
import { Screen, TopBar } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

export default function Packages() {
  const { t } = useI18n()
  const { cartLines } = usePatient()
  return (
    <Screen header={<TopBar title={t('home.packages')} back="/patient" />} footer={cartLines.length > 0 ? <CartBar /> : undefined}>
      <div className="space-y-4 px-5 py-5">
        <p className="text-sm text-slate-500">{t('packages.intro')}</p>
        {packages
          .filter((p) => p.active)
          .map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
      </div>
    </Screen>
  )
}
