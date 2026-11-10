import { useMemo } from 'react'
import { Feather, Gem, PawPrint, Shirt, Trophy, Users } from 'lucide-react'
import { PET_MAX_LEVEL } from '@shared/analysis/pets'
import { pantheonArt as pantheonArtSafe, pantheonKind, type PantheonKind } from '@shared/gamedata/art'
import { classInfo } from '@shared/gamedata/classes'
import { formatStatValue } from '@shared/gamedata/stats'
import { gradeColorVar, PantheonPiece } from '@/components/art'
import { PantheonBoard, TitleCard } from '@/components/collections'
import { ClassIcon } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { PageHeader, StatTile } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { ProgressBar, ScoreRing } from '@/components/ui/Progress'
import { Tooltip } from '@/components/ui/InfoTip'
import { ago, cn, compact, fmt } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { useApp } from '@/lib/store'
import { t } from '@shared/i18n'
import { ruName, term } from '@shared/names'

const LEVEL_COLOR: Record<number, string> = { 1: 'bg-grade-common', 2: 'bg-grade-legend', 3: 'bg-grade-unique' }

export function CollectionsPage() {
  const ctx = useCharacterContext()!
  const { char, report } = ctx
  const pets = report.pets
  const roster = useApp((s) => s.source?.data?.roster ?? [])

  return (
    <>
      <PageHeader
        icon={<PawPrint size={22} />}
        title={t('Питомцы и коллекции')}
        subtitle={t(
          'Всё, что копится долго: титулы, пантеон, питомцы (от них растёт Знание о видах), крылья, облики и монолиты. Наведите на любой элемент — там пояснение.'
        )}
      />

      <TitlesSection />
      <PantheonSection />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <Card
          title={t('Питомцы')}
          hint={t('У каждого питомца уровень 1–3. Чем больше питомцев рода и чем выше их уровни, тем выше уровень Знания о видах и тем больше ячеек открыто.')}
        >
          <div className="flex items-center gap-6">
            <Tooltip content={t('Доля набранных уровней у собранных питомцев: каждый питомец качается до ур. 3.')} wide>
              <ScoreRing value={pets.progress} size={110} label={t('уровней')} />
            </Tooltip>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <StatTile label={t('Собрано')} value={fmt(pets.owned)} hint={t('Сколько разных питомцев в коллекции.')} />
                <StatTile label={t('Макс. ур.')} value={fmt(pets.maxed)} hint={t('Питомцы, прокачанные до ур. 3.')} />
                <StatTile
                  label={t('Ещё уровней')}
                  value={fmt(pets.levelsLeft)}
                  hint={t('Сколько уровней ещё можно поднять у уже собранных питомцев (души питомцев).')}
                />
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
                      {t('ур. {lvl}:', { lvl })} <span className="tnum text-ink-2">{pets.byLevel[lvl] ?? 0}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-3">
            {t(
              'Каждый уровень питомца до {PET_MAX_LEVEL}-го — это души питомца из монстров. Список питомцев по родам оверлей отдаёт только номерами, поэтому по родам здесь не разбито — смотрите итог на странице «Знание о видах».',
              { PET_MAX_LEVEL }
            )}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3 self-start">
          <BigTile
            icon={<Feather size={18} />}
            label={t('Крылья')}
            tip={t('Сколько крыльев собрано и какие надеты (номер из данных игры — названий в оверлее нет).')}
            value={char.wings.length}
            sub={char.equippedWing ? t('надеты #{equippedWing}', { equippedWing: char.equippedWing }) : t('не надеты')}
          />
          <BigTile
            icon={<Shirt size={18} />}
            label={t('Облики')}
            tip={t('Предметы внешнего вида в коллекции.')}
            value={char.skinsOwned}
            sub={t('предметов внешнего вида')}
          />
          <BigTile
            icon={<Gem size={18} />}
            label={t('Монолиты')}
            tip={t('Знаки монолитов: копятся для постоянных бонусов к статам.')}
            value={char.monoliths.reduce((s, m) => s + m.tokens, 0)}
            sub={char.monoliths.map((m) => `#${m.monolith}: ${m.tokens}`).join(' · ') || t('нет данных')}
          />
          <BigTile
            icon={<Trophy size={18} />}
            label={t('Очки Бездны')}
            tip={t('Очки Бездны текущего сезона и счёт: убийства / смерти / помощь.')}
            value={char.abyss ? compact(char.abyss.points) : '—'}
            sub={char.abyss ? `${char.abyss.kills} / ${char.abyss.deaths} / ${char.abyss.assists}` : undefined}
          />
        </div>
      </div>

      <Card
        title={t('Персонажи аккаунта')}
        className="mt-5"
        hint={t('Все, кого оверлей видел на аккаунте. Подробные данные есть только у тех, кем вы заходили с запущенным оверлеем.')}
      >
        <div className="-mx-2">
          {roster.map((r) => (
            <div
              key={r.key}
              className={cn('flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] hover:bg-surface-2', r.key === char.key && 'bg-accent-soft')}
            >
              <ClassIcon cls={r.cls} size={16} className="text-ink-3" />
              <span className="w-40 truncate font-medium">{r.name}</span>
              <span className="w-28 text-ink-3">{term(classInfo(r.cls), '—')}</span>
              <span className="tnum w-16 text-ink-3">{t('ур. {level}', { level: r.level })}</span>
              <span className="tnum w-28">{t('БМ {combatPower}', { combatPower: compact(r.combatPower) })}</span>
              <span className="flex-1 text-xs text-ink-3">{r.seenAt ? ago(r.seenAt) : ''}</span>
              {!r.hasDetails && <Pill>{t('только список')}</Pill>}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
          <Users size={12} /> {t('Переключить персонажа — в меню слева, под названием приложения.')}
        </p>
      </Card>
    </>
  )
}

function BigTile({ icon, label, value, sub, tip }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; tip?: string }) {
  return (
    <Tooltip content={tip} block>
      <div className="w-full rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] tracking-wide text-ink-3 uppercase">
          <span className="text-accent">{icon}</span>
          {label}
        </div>
        <div className="tnum mt-1.5 text-2xl font-semibold">{typeof value === 'number' ? fmt(value) : value}</div>
        {sub && <div className="mt-0.5 truncate text-xs text-ink-3">{sub}</div>}
      </div>
    </Tooltip>
  )
}

function TitlesSection() {
  const ctx = useCharacterContext()!
  const { report, namer } = ctx
  const tr = report.titles
  const collection = [...tr.collection.entries()].sort((a, b) => b[1] - a[1])
  return (
    <Card
      title={t('Титулы')}
      className="mb-5"
      hint={t(
        'Надеть можно по одному титулу каждой категории: атака, защита, другое. «Эффект при наличии» работает от всех собранных титулов — даже не надетых.'
      )}
      actions={
        <Tooltip content={t('Собрано {owned} из {total} титулов в справочнике.', { owned: tr.owned, total: tr.total })}>
          <div className="flex w-48 items-center gap-2 text-xs text-ink-3">
            <ProgressBar value={(tr.owned / Math.max(1, tr.total)) * 100} color="var(--color-accent)" className="flex-1" />
            <span className="tnum text-ink-2">
              {tr.owned}/{tr.total}
            </span>
          </div>
        </Tooltip>
      }
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {tr.slots.map((s) => (
          <TitleCard key={s.category} slot={s} namer={namer} />
        ))}
      </div>
      {collection.length > 0 && (
        <div className="mt-4">
          <Tooltip content={t('Сумма «эффектов при наличии» всех собранных титулов. Это постоянный бонус — он уже входит в статы персонажа.')}>
            <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{t('Все собранные титулы дают')}</div>
          </Tooltip>
          <div className="flex flex-wrap gap-1.5">
            {collection.map(([stat, value]) => (
              <span key={stat} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs">
                <span className="text-ink-2">{namer.stat(stat).main}</span>
                <span className="tnum font-semibold text-aether">{formatStatValue(stat, value)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

const PANTHEON_TOTAL: Record<PantheonKind, number> = { colossus: 1, statue: 4, painting: 12 }
const PANTHEON_RU: Record<PantheonKind, string> = { colossus: t('Колосс'), statue: t('Статуи'), painting: t('Картины') }

function PantheonSection() {
  const { char } = useCharacterContext()!
  const placed = useMemo(() => new Map(char.pantheon.map((p) => [p.slot, p.deco])), [char.pantheon])
  const count = (kind: PantheonKind) => char.pantheon.filter((p) => pantheonKind(p.slot) === kind).length
  const kinds: PantheonKind[] = ['colossus', 'statue', 'painting']
  return (
    <Card
      title={t('Пантеон')}
      className="mb-5"
      hint={t(
        'Украшения из шкафа, расставленные в пантеоне: колосс в центре, четыре статуи и двенадцать картин. Каждое даёт статы богов («Эффекты размещения» в игре).'
      )}
      actions={<Pill tip={t('Сколько мест пантеона занято из 17.')}>{char.pantheon.length} / 17</Pill>}
    >
      <div className="flex flex-wrap items-center gap-8">
        <PantheonBoard placed={placed} size={360} />
        <div className="min-w-[240px] flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {kinds.map((k) => (
              <Tooltip
                key={k}
                block
                content={t('{PANTHEON_RU}: занято {count} из {PANTHEON_TOTAL}.', {
                  PANTHEON_RU: PANTHEON_RU[k],
                  count: count(k),
                  PANTHEON_TOTAL: PANTHEON_TOTAL[k]
                })}
              >
                <div className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2">
                  <div className="text-[11px] tracking-wide text-ink-3 uppercase">{PANTHEON_RU[k]}</div>
                  <div className={cn('tnum text-lg font-semibold', count(k) === PANTHEON_TOTAL[k] ? 'text-good' : 'text-ink')}>
                    {count(k)}
                    <span className="text-sm text-ink-3">/{PANTHEON_TOTAL[k]}</span>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {[...char.pantheon]
              .sort((a, b) => b.slot - a.slot)
              .map((p) => (
                <PantheonRow key={p.slot} slot={p.slot} deco={p.deco} />
              ))}
          </div>
          {count('painting') < PANTHEON_TOTAL.painting && (
            <p className="text-xs leading-relaxed text-warning">
              {t('Свободно картин:')} {PANTHEON_TOTAL.painting - count('painting')}
              {t('. Любая картина из шкафа добавит статы богов — пустое место ничего не даёт.')}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

function PantheonRow({ slot, deco }: { slot: number; deco: number }) {
  const art = pantheonArtSafe(deco)
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-surface-2">
      <PantheonPiece slot={slot} deco={deco} size={30} />
      <span className="min-w-0 truncate text-[13px]" style={{ color: art ? gradeColorVar(art.grade) : undefined }}>
        {art ? ruName(art.ru, t('Украшение пантеона')) : t('Украшение #{deco}', { deco })}
      </span>
    </div>
  )
}
