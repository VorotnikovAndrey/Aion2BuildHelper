import { useState } from 'react'
import { CircleDot, Crown, Ear, Footprints, Gem, Hand, HardHat, Hexagon, Pencil, Shield, Shirt, Sword, Watch, Wind, type LucideIcon } from 'lucide-react'
import type { ItemReport } from '@shared/analysis/gear'
import { formatStatValue } from '@shared/gamedata/stats'
import { slotDef } from '@shared/gamedata/slots'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { GradeText, gradeBorder, VERDICT_TEXT, VerdictChip, WishChip } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { Legend, PageHeader, StatTile } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { useApp } from '@/lib/store'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const SLOT_ICON: Record<string, LucideIcon> = {
  weapon: Sword,
  guarder: Shield,
  helmet: HardHat,
  shoulder: Crown,
  torso: Shirt,
  pants: Shirt,
  gloves: Hand,
  boots: Footprints,
  cape: Wind,
  necklace: Gem,
  pendant: Gem,
  amulet: Gem,
  belt: Hexagon
}
const slotIcon = (slot: number): LucideIcon => {
  const key = slotDef(slot).key
  if (SLOT_ICON[key]) return SLOT_ICON[key]
  if (key.endsWith('Earring')) return Ear
  if (key.endsWith('Ring')) return CircleDot
  if (key.endsWith('Bracelet')) return Watch
  return Hexagon
}

export function GearPage() {
  const ctx = useCharacterContext()!
  const { char, report } = ctx
  const [onlyFix, setOnlyFix] = useState(false)
  const items = report.gear
  const withLines = items.filter((i) => i.total > 0 || i.manastones.length)
  const rest = items.filter((i) => i.total === 0 && !i.manastones.length)
  const shown = onlyFix ? withLines.filter((i) => i.replace.length || i.manastones.some((m) => m.weight <= 1)) : withLines
  const stones = items.flatMap((i) => i.manastones)
  const useful = items.reduce((s, i) => s + i.useful, 0)
  const total = items.reduce((s, i) => s + i.total, 0)

  return (
    <>
      <PageHeader
        icon={<Shirt size={22} />}
        title="Шмот"
        subtitle="Каждая строка вещи сверена с приоритетами гайда: зелёное — то, что нужно, бирюзовое — полезно, серое — слабо, зачёркнутое — бесполезно, менять. «Ловить» — что искать при перековке или замене (только то, что встречается на этом слоте)."
        actions={<GuideSwitcher char={char} />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Оценка шмота" value={`${report.scores.gear} / 100`} hint="Средняя польза строк на вещах (75%) и манакамней (25%) по весам гайда." />
        <StatTile label="Полезных строк" value={`${useful} из ${total}`} sub="вес в гайде 3 и выше" />
        <StatTile label="Менять" value={items.reduce((s, i) => s + i.replace.length, 0)} sub="строк, которые гайд не ценит" />
        <StatTile
          label="Манакамни"
          value={`${stones.filter((m) => m.weight >= 3).length} из ${stones.length}`}
          sub={`слабых: ${stones.filter((m) => m.weight <= 1).length}`}
        />
      </div>

      <Card
        bodyClassName="p-0"
        title="Экипировка"
        actions={
          <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-2">
            <input type="checkbox" checked={onlyFix} onChange={(e) => setOnlyFix(e.target.checked)} className="accent-[var(--color-accent)]" />
            Только что менять
          </label>
        }
      >
        <div className="grid grid-cols-[minmax(200px,1.1fr)_90px_minmax(260px,2fr)_minmax(180px,1.2fr)] gap-x-4 border-b border-line px-5 py-2 text-[11px] tracking-wide text-ink-3 uppercase">
          <span>Вещь</span>
          <span>Полезных</span>
          <span>Сейчас стоит</span>
          <span>Ещё ловить</span>
        </div>
        {shown.map((item) => (
          <ItemRow key={item.slot} item={item} ctx={ctx} />
        ))}
        {shown.length === 0 && <p className="px-5 py-6 text-[13px] text-good">Менять нечего — все строки полезны по гайду.</p>}
      </Card>

      {rest.length > 0 && (
        <Card
          title="Без случайных строк"
          className="mt-5"
          hint="Браслеты, пояс, руны, амулет: у них нет строк, которые можно сверить с гайдом — важны грейд и заточка."
        >
          <div className="flex flex-wrap gap-2">
            {rest.map((i) => {
              const Icon = slotIcon(i.slot)
              return (
                <div key={i.slot} className={cn('flex items-center gap-2 rounded-lg border bg-surface-2 px-3 py-2 text-[13px]', gradeBorder(i.grade))}>
                  <Icon size={14} className="text-ink-3" />
                  <GradeText grade={i.grade}>{ctx.namer.item(i.item.item, i.slot).main}</GradeText>
                  <span className="tnum text-xs text-ink-3">
                    +{i.item.enchant} · ур. {i.item.itemLevel}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Legend
        items={[
          { swatch: <VerdictChip verdict="great">зелёное</VerdictChip>, text: 'нужно по гайду (вес 4–5)' },
          { swatch: <VerdictChip verdict="good">бирюзовое</VerdictChip>, text: 'полезно (3)' },
          { swatch: <VerdictChip verdict="weak">серое</VerdictChip>, text: 'слабо (1–2)' },
          { swatch: <VerdictChip verdict="bad">зачёркнутое</VerdictChip>, text: 'бесполезно — менять' },
          { swatch: <WishChip>голубое</WishChip>, text: 'что ловить' }
        ]}
      />
    </>
  )
}

function ItemRow({ item, ctx }: { item: ItemReport; ctx: Ctx }) {
  const { namer } = ctx
  const names = useApp((s) => s.settings.names)
  const update = useApp((s) => s.updateSettings)
  const [editing, setEditing] = useState(false)
  const Icon = slotIcon(item.slot)
  const label = namer.item(item.item.item, item.slot)
  const custom = names.items?.[item.item.item]
  const slot = slotDef(item.slot)

  const saveName = (value: string) => {
    const next = { ...names.items }
    if (value.trim()) next[item.item.item] = value.trim()
    else delete next[item.item.item]
    void update({ names: { ...names, items: next } })
    setEditing(false)
  }

  return (
    <div className="grid grid-cols-[minmax(200px,1.1fr)_90px_minmax(260px,2fr)_minmax(180px,1.2fr)] items-start gap-x-4 border-b border-line px-5 py-3 last:border-b-0 hover:bg-surface-2/50">
      <div className="flex min-w-0 items-start gap-3">
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-surface-2', gradeBorder(item.grade))}>
          <Icon size={18} className="text-ink-2" />
        </span>
        <div className="group min-w-0">
          {editing ? (
            <input
              autoFocus
              defaultValue={custom ?? ''}
              placeholder={slot.ru}
              onBlur={(e) => saveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName((e.target as HTMLInputElement).value)
                if (e.key === 'Escape') setEditing(false)
              }}
              className="w-full rounded-md border border-line-strong bg-surface-3 px-2 py-0.5 text-[13px] outline-none focus:border-accent"
            />
          ) : (
            <button onClick={() => setEditing(true)} className="flex max-w-full items-center gap-1.5 text-left" title="Дать вещи своё название">
              <GradeText grade={item.grade} className="truncate text-[13px] font-semibold">
                {label.main}
              </GradeText>
              <Pencil size={11} className="shrink-0 text-ink-3 opacity-0 group-hover:opacity-100" />
            </button>
          )}
          <div className="tnum mt-0.5 text-[11px] text-ink-3">
            {custom ? `${slot.ru} · ` : ''}+{item.item.enchant} · ур. предмета {item.item.itemLevel}
          </div>
        </div>
      </div>

      <div className="pt-1">
        <Pill tone={toneOfShare(item.useful, item.total)}>
          {item.useful} из {item.total}
        </Pill>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          {item.lines.map((l, i) => (
            <VerdictChip key={i} verdict={l.verdict} tip={`${VERDICT_TEXT[l.verdict]}${l.weight ? ` · вес ${l.weight}` : ''}`}>
              {l.kind === 'stat' ? (
                <>
                  {namer.stat(l.id).main} <span className="tnum opacity-80">{formatStatValue(l.id, l.value)}</span>
                </>
              ) : (
                <>
                  {namer.skill(l.id).main} <span className="opacity-70">ур. {l.value}</span>
                </>
              )}
            </VerdictChip>
          ))}
        </div>
        {item.manastones.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="mr-0.5 text-[10.5px] text-ink-3">манакамни:</span>
            {item.manastones.map((m, i) => (
              <VerdictChip key={i} verdict={m.verdict} className="px-1.5 py-0 text-[11px]" tip={`Манакамень, грейд ${m.grade} · ${VERDICT_TEXT[m.verdict]}`}>
                {namer.stat(m.stat).main}
                <span className="opacity-60">{'•'.repeat(m.grade)}</span>
              </VerdictChip>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {item.wishlist.map((w) => (
          <WishChip key={`${w.kind}${w.id}`} tip={`Вес в гайде: ${w.weight}`}>
            {w.kind === 'stat' ? namer.stat(w.id).main : namer.skill(w.id).main}
          </WishChip>
        ))}
        {item.wishlist.length === 0 && <span className="text-xs text-ink-3">—</span>}
      </div>
    </div>
  )
}
