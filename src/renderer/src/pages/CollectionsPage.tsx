import { Feather, Gem, Home, PawPrint, Shirt, Trophy, Users } from 'lucide-react'
import { PET_MAX_LEVEL } from '@shared/analysis/pets'
import { classInfo } from '@shared/gamedata/classes'
import { ClassIcon } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { PageHeader, StatTile } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { ScoreRing } from '@/components/ui/Progress'
import { ago, cn, compact, fmt } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { useApp } from '@/lib/store'

const LEVEL_COLOR: Record<number, string> = { 1: 'bg-grade-common', 2: 'bg-grade-rare', 3: 'bg-grade-unique' }

export function CollectionsPage() {
  const ctx = useCharacterContext()!
  const { char, report } = ctx
  const pets = report.pets
  const roster = useApp((s) => s.source?.data?.roster ?? [])

  return (
    <>
      <PageHeader
        icon={<PawPrint size={22} />}
        title="Питомцы и коллекции"
        subtitle="Всё, что копится долго: питомцы (от них растёт Познание рода), крылья, титулы, облики, монолиты и украшения легиона."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <Card
          title="Питомцы"
          hint="У каждого питомца уровень 1–3. Чем больше питомцев рода и чем выше их уровни, тем выше уровень Познания рода и тем больше ячеек открыто."
        >
          <div className="flex items-center gap-6">
            <ScoreRing value={pets.progress} size={110} label="уровней" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <StatTile label="Собрано" value={fmt(pets.owned)} />
                <StatTile label="Макс. ур." value={fmt(pets.maxed)} />
                <StatTile label="Ещё уровней" value={fmt(pets.levelsLeft)} />
              </div>
              <div>
                <div className="flex h-3 overflow-hidden rounded-full bg-surface-3">
                  {[1, 2, 3].map((lvl) => (
                    <div key={lvl} className={LEVEL_COLOR[lvl]} style={{ width: `${pets.owned ? ((pets.byLevel[lvl] ?? 0) / pets.owned) * 100 : 0}%` }} />
                  ))}
                </div>
                <div className="mt-2 flex gap-4 text-xs text-ink-3">
                  {[1, 2, 3].map((lvl) => (
                    <span key={lvl} className="flex items-center gap-1.5">
                      <span className={cn('h-2 w-2 rounded-full', LEVEL_COLOR[lvl])} />
                      ур. {lvl}: <span className="tnum text-ink-2">{pets.byLevel[lvl] ?? 0}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-3">
            Каждый уровень питомца до {PET_MAX_LEVEL}-го — это души питомца из монстров. Список питомцев по родам оверлей отдаёт только номерами, поэтому по
            родам здесь не разбито — смотрите итог на странице «Познание рода».
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3 self-start">
          <BigTile
            icon={<Feather size={18} />}
            label="Крылья"
            value={char.wings.length}
            sub={char.equippedWing ? `надеты #${char.equippedWing}` : 'не надеты'}
          />
          <BigTile icon={<Trophy size={18} />} label="Титулы" value={char.ownedTitles.length} sub={`надето: ${char.titles.length}`} />
          <BigTile icon={<Shirt size={18} />} label="Облики" value={char.skinsOwned} sub="предметов внешнего вида" />
          <BigTile icon={<Home size={18} />} label="Украшения легиона" value={char.pantheon.length} sub="поставлено в зале" />
          <BigTile
            icon={<Gem size={18} />}
            label="Монолиты"
            value={char.monoliths.reduce((s, m) => s + m.tokens, 0)}
            sub={char.monoliths.map((m) => `#${m.monolith}: ${m.tokens}`).join(' · ') || 'нет данных'}
          />
          <BigTile
            icon={<Trophy size={18} />}
            label="Очки Бездны"
            value={char.abyss ? compact(char.abyss.points) : '—'}
            sub={char.abyss ? `${char.abyss.kills} / ${char.abyss.deaths} / ${char.abyss.assists}` : undefined}
          />
        </div>
      </div>

      <Card
        title="Персонажи аккаунта"
        className="mt-5"
        hint="Все, кого оверлей видел на аккаунте. Подробные данные есть только у тех, кем вы заходили с запущенным оверлеем."
      >
        <div className="-mx-2">
          {roster.map((r) => (
            <div
              key={r.key}
              className={cn('flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] hover:bg-surface-2', r.key === char.key && 'bg-accent-soft')}
            >
              <ClassIcon cls={r.cls} size={16} className="text-ink-3" />
              <span className="w-40 truncate font-medium">{r.name}</span>
              <span className="w-28 text-ink-3">{classInfo(r.cls)?.ru ?? '—'}</span>
              <span className="tnum w-16 text-ink-3">ур. {r.level}</span>
              <span className="tnum w-28">БМ {compact(r.combatPower)}</span>
              <span className="flex-1 text-xs text-ink-3">{r.seenAt ? ago(r.seenAt) : ''}</span>
              {!r.hasDetails && <Pill>только список</Pill>}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
          <Users size={12} /> Переключить персонажа — в меню слева, под названием приложения.
        </p>
      </Card>
    </>
  )
}

function BigTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] tracking-wide text-ink-3 uppercase">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className="tnum mt-1.5 text-2xl font-semibold">{typeof value === 'number' ? fmt(value) : value}</div>
      {sub && <div className="mt-0.5 truncate text-xs text-ink-3">{sub}</div>}
    </div>
  )
}
