import { useState } from 'react'
import { CircleDot, Crown, Ear, Footprints, Gem, Hand, HardHat, Hexagon, Pencil, Shield, Shirt, Sword, Watch, Wind, type LucideIcon } from 'lucide-react'
import type { ItemReport } from '@shared/analysis/gear'
import { formatStatValue } from '@shared/gamedata/stats'
import { GRADES, slotDef } from '@shared/gamedata/slots'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { SkillIcon } from '@/components/icons'
import { GradeText, gradeBorder, VERDICT_TEXT, VerdictChip, WishChip } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { Legend, PageHeader, StatTile } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { verdictWhy } from '@/lib/status'
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

const COLS = 'grid-cols-[minmax(200px,1.1fr)_90px_minmax(260px,2fr)_minmax(180px,1.2fr)]'

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
  const toReplace = items.reduce((s, i) => s + i.replace.length, 0)
  const weakStones = stones.filter((m) => m.weight <= 1).length

  return (
    <>
      <PageHeader
        icon={<Shirt size={22} />}
        title="Шмот"
        subtitle="Каждая строка вещи сверена с приоритетами гайда: зелёное — как нужно, жёлтое — приемлемо или слабо, красное зачёркнутое — не по гайду, менять. «Ещё ловить» — что искать при перековке или замене (только то, что встречается на этом слоте). Наведите на любую строку — там пояснение."
        actions={<GuideSwitcher char={char} />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Оценка шмота"
          value={`${report.scores.gear} / 100`}
          valueClassName={report.scores.gear >= 85 ? 'text-good' : report.scores.gear >= 60 ? 'text-warning' : 'text-critical'}
          hint="Средняя польза строк на вещах (75%) и манакамней (25%) по весам гайда. 85+ — зелёный, 60–84 — жёлтый, ниже — красный."
        />
        <StatTile
          label="Полезных строк"
          value={`${useful} из ${total}`}
          sub="важность в гайде 3 и выше"
          hint="Строки вещей, которые гайд ценит (зелёные и жёлтые «приемлемо»)."
        />
        <StatTile
          label="Менять"
          value={toReplace}
          valueClassName={toReplace ? 'text-critical' : 'text-good'}
          sub="строк, которые гайд не ценит"
          hint="Красные зачёркнутые строки: стат, которого нет в приоритетах гайда. Их стоит перековать в первую очередь."
        />
        <StatTile
          label="Манакамни"
          value={`${stones.filter((m) => m.weight >= 3).length} из ${stones.length}`}
          sub={`слабых: ${weakStones}`}
          valueClassName={weakStones ? 'text-warning' : 'text-good'}
          hint="Сколько манакамней со статами, важными по гайду (важность 3+). Слабые — важность 0–1."
        />
      </div>

      <Card
        bodyClassName="p-0"
        title="Экипировка"
        actions={
          <Tooltip content="Показать только вещи, где есть красные строки или слабые манакамни.">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-2">
              <input type="checkbox" checked={onlyFix} onChange={(e) => setOnlyFix(e.target.checked)} className="accent-[var(--color-accent)]" />
              Только что менять
            </label>
          </Tooltip>
        }
      >
        <div className={cn('grid gap-x-4 border-b border-line px-5 py-2 text-[11px] tracking-wide text-ink-3 uppercase', COLS)}>
          <span>Вещь</span>
          <Tooltip content="Сколько строк вещи (статы и умения) гайд ценит на 3 и выше — из всех строк.">
            <span>Полезных</span>
          </Tooltip>
          <span>Сейчас стоит</span>
          <Tooltip content="Важные по гайду статы и умения, которых на вещи нет, — что искать при перековке или замене.">
            <span>Ещё ловить</span>
          </Tooltip>
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
                <Tooltip
                  key={i.slot}
                  content={`${slotDef(i.slot).ru}: ${GRADES[i.grade].ru.toLowerCase()}, заточка +${i.item.enchant}, уровень предмета ${i.item.itemLevel}.`}
                >
                  <div className={cn('flex items-center gap-2 rounded-lg border bg-surface-2 px-3 py-2 text-[13px]', gradeBorder(i.grade))}>
                    <Icon size={14} className="text-ink-3" />
                    <GradeText grade={i.grade}>{ctx.namer.item(i.item.item, i.slot).main}</GradeText>
                    <span className="tnum text-xs text-ink-3">
                      +{i.item.enchant} · ур. {i.item.itemLevel}
                    </span>
                  </div>
                </Tooltip>
              )
            })}
          </div>
        </Card>
      )}

      <Legend
        items={[
          { swatch: <VerdictChip verdict="great">зелёное</VerdictChip>, text: 'нужно по гайду (важность 4–5)' },
          { swatch: <VerdictChip verdict="good">жёлтое</VerdictChip>, text: 'приемлемо (3)' },
          { swatch: <VerdictChip verdict="weak">пунктир</VerdictChip>, text: 'слабо (1–2), при случае заменить' },
          { swatch: <VerdictChip verdict="bad">зачёркнутое</VerdictChip>, text: 'не по гайду — менять' },
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
    <div className={cn('grid items-start gap-x-4 border-b border-line px-5 py-3 last:border-b-0 hover:bg-surface-2/50', COLS)}>
      <div className="flex min-w-0 items-start gap-3">
        <Tooltip
          content={`${slot.ru} · ${GRADES[item.grade].ru.toLowerCase()} · заточка +${item.item.enchant} · уровень предмета ${item.item.itemLevel}. Цвет рамки — грейд.`}
        >
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-surface-2', gradeBorder(item.grade))}>
            <Icon size={18} className="text-ink-2" />
          </span>
        </Tooltip>
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
            <Tooltip content="Нажмите, чтобы дать вещи своё название (например, как в игре: «Шлем Нуакума»). Пустое поле — вернуть название слота.">
              <button onClick={() => setEditing(true)} className="flex max-w-full items-center gap-1.5 text-left">
                <GradeText grade={item.grade} className="truncate text-[13px] font-semibold">
                  {label.main}
                </GradeText>
                <Pencil size={11} className="shrink-0 text-ink-3 opacity-0 group-hover:opacity-100" />
              </button>
            </Tooltip>
          )}
          <div className="tnum mt-0.5 text-[11px] text-ink-3">
            {custom ? `${slot.ru} · ` : ''}+{item.item.enchant} · ур. предмета {item.item.itemLevel}
          </div>
        </div>
      </div>

      <div className="pt-1">
        <Pill
          tone={toneOfShare(item.useful, item.total)}
          tip={`${item.useful} из ${item.total} строк гайд ценит на 3+. ${item.replace.length ? `Менять: ${item.replace.length}.` : 'Бесполезных строк нет.'}`}
        >
          {item.useful} из {item.total}
        </Pill>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          {item.lines.map((l, i) => (
            <VerdictChip
              key={i}
              verdict={l.verdict}
              tip={
                <>
                  <b className="text-ink">{l.kind === 'stat' ? namer.stat(l.id).main : namer.skill(l.id).main}</b>
                  {l.kind === 'skill' && <span className="block text-ink-3">Умение строкой на вещи: +{l.value} к уровню.</span>}
                  <span className="mt-1 block">{verdictWhy(l.verdict, l.weight)}</span>
                </>
              }
            >
              {l.kind === 'stat' ? (
                <>
                  {namer.stat(l.id).main} <span className="tnum opacity-80">{formatStatValue(l.id, l.value)}</span>
                </>
              ) : (
                <>
                  <SkillIcon id={l.id} size={16} />
                  {namer.skill(l.id).main} <span className="opacity-70">ур. {l.value}</span>
                </>
              )}
            </VerdictChip>
          ))}
        </div>
        {item.manastones.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <Tooltip content="Манакамни, вставленные в вещь. Точки — грейд строки камня (1–3).">
              <span className="mr-0.5 text-[10.5px] text-ink-3">манакамни:</span>
            </Tooltip>
            {item.manastones.map((m, i) => (
              <VerdictChip
                key={i}
                verdict={m.verdict}
                className="px-1.5 py-0 text-[11px]"
                tip={`Манакамень: ${namer.stat(m.stat).main}, грейд ${m.grade}. ${verdictWhy(m.verdict, m.weight)} (${VERDICT_TEXT[m.verdict]})`}
              >
                {namer.stat(m.stat).main}
                <span className="opacity-60">{'•'.repeat(m.grade)}</span>
              </VerdictChip>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {item.wishlist.map((w) => (
          <WishChip
            key={`${w.kind}${w.id}`}
            tip={`Важность в гайде: ${w.weight} из 5. ${w.kind === 'skill' ? 'Умение может выпасть строкой на этом слоте.' : 'Встречается строкой на этом слоте.'}`}
          >
            {w.kind === 'skill' && <SkillIcon id={w.id} size={14} className="mr-1" />}
            {w.kind === 'stat' ? namer.stat(w.id).main : namer.skill(w.id).main}
          </WishChip>
        ))}
        {item.wishlist.length === 0 && <span className="text-xs text-ink-3">—</span>}
      </div>
    </div>
  )
}
