import { useState } from 'react'
import { Pencil, Shirt } from 'lucide-react'
import type { ItemReport } from '@shared/analysis/gear'
import { stoneInfo } from '@shared/gamedata/art'
import { formatStatValue } from '@shared/gamedata/stats'
import { GRADES, slotDef, type SlotGroup } from '@shared/gamedata/slots'
import { ItemIcon, StatusBadge, StoneIcon } from '@/components/art'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { SkillIcon } from '@/components/icons'
import { GradeText, VERDICT_TEXT, VerdictChip, WishChip } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { Legend, PageHeader, StatTile } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { verdictWhy, type Tone } from '@/lib/status'
import { useApp } from '@/lib/store'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const COLS = 'grid-cols-[minmax(230px,1.2fr)_90px_minmax(260px,2fr)_minmax(180px,1.2fr)]'

/** Итог по вещи для значка на иконке: красное — есть что перековать, жёлтое — слабые строки или камни. */
function itemTone(i: ItemReport): Tone {
  if (i.total === 0 && !i.manastones.length) return 'neutral'
  if (i.replace.length) return 'bad'
  if (i.lines.some((l) => l.verdict === 'weak') || i.manastones.some((m) => m.weight <= 1)) return 'warn'
  return 'ok'
}

const TONE_WHY: Record<Tone, string> = {
  ok: 'Все строки и камни полезны по гайду.',
  warn: 'Есть слабые строки или камни — при случае заменить.',
  bad: 'Есть строки не по гайду — их стоит перековать.',
  neutral: 'Случайных строк нет — важны грейд и заточка.'
}

const PANEL_GROUPS: { id: SlotGroup; ru: string }[] = [
  { id: 'weapon', ru: 'Оружие' },
  { id: 'armor', ru: 'Броня' },
  { id: 'accessory', ru: 'Украшения' }
]

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

  const jumpTo = (slot: number) => document.getElementById(`gear-${slot}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

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
          label="Камни маны"
          value={`${stones.filter((m) => m.weight >= 3).length} из ${stones.length}`}
          sub={`слабых: ${weakStones}`}
          valueClassName={weakStones ? 'text-warning' : 'text-good'}
          hint="Сколько камней маны и духовных камней со статами, важными по гайду (важность 3+). Слабые — важность 0–1."
        />
      </div>

      <Card
        title="Снаряжение"
        className="mb-5"
        hint="Все надетые вещи — как в окне персонажа. Значок в углу — итог сверки с гайдом; нажмите на вещь, чтобы перейти к её строкам."
      >
        <div className="flex flex-wrap gap-x-8 gap-y-5">
          {PANEL_GROUPS.map((g) => {
            const list = items.filter((i) => i.group === g.id)
            if (!list.length) return null
            return (
              <div key={g.id} className="min-w-0">
                <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{g.ru}</div>
                <div className="flex flex-wrap gap-2.5">
                  {list.map((i) => (
                    <PanelItem key={i.slot} item={i} ctx={ctx} onClick={() => jumpTo(i.slot)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card
        bodyClassName="p-0"
        title="Строки вещей"
        actions={
          <Tooltip content="Показать только вещи, где есть красные строки или слабые камни.">
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
          <div className="flex flex-wrap gap-3">
            {rest.map((i) => {
              const name = ctx.namer.item(i.item.item, i.slot).main
              return (
                <Tooltip
                  key={i.slot}
                  content={`${name}: ${slotDef(i.slot).ru.toLowerCase()}, ${GRADES[i.grade].ru.toLowerCase()}, заточка +${i.item.enchant}, уровень предмета ${i.item.itemLevel}.`}
                >
                  <div id={`gear-${i.slot}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 py-2 pr-4 pl-2">
                    <ItemIcon itemId={i.item.item} slot={i.slot} enchant={i.item.enchant} size={44} />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold">
                        <GradeText grade={i.grade}>{name}</GradeText>
                      </div>
                      <div className="tnum text-[11px] text-ink-3">
                        {slotDef(i.slot).ru} · +{i.item.enchant} · ур. {i.item.itemLevel}
                      </div>
                    </div>
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
          { swatch: <WishChip>голубое</WishChip>, text: 'что ловить' },
          { swatch: <StatusBadge tone="ok" />, text: 'значок на вещи — итог по ней' }
        ]}
      />
    </>
  )
}

function PanelItem({ item, ctx, onClick }: { item: ItemReport; ctx: Ctx; onClick: () => void }) {
  const tone = itemTone(item)
  const name = ctx.namer.item(item.item.item, item.slot).main
  return (
    <Tooltip
      wide
      content={
        <>
          <GradeText grade={item.grade} className="font-semibold">
            {name}
          </GradeText>
          <span className="block text-ink-3">
            {slotDef(item.slot).ru} · {GRADES[item.grade].ru.toLowerCase()} · заточка +{item.item.enchant} · ур. предмета {item.item.itemLevel}
          </span>
          {item.total > 0 && (
            <span className="mt-1 block">
              Полезных строк: {item.useful} из {item.total}
              {item.replace.length ? `, менять: ${item.replace.length}` : ''}.
            </span>
          )}
          <span className="mt-1 block">{TONE_WHY[tone]}</span>
        </>
      }
    >
      <button onClick={onClick} className="group flex w-[64px] flex-col items-center gap-1">
        <ItemIcon
          itemId={item.item.item}
          slot={item.slot}
          enchant={item.item.enchant}
          size={56}
          status={tone}
          className="transition-transform group-hover:-translate-y-0.5"
        />
        <span className="w-full truncate text-center text-[10.5px] text-ink-3 group-hover:text-ink-2">{slotDef(item.slot).ru}</span>
      </button>
    </Tooltip>
  )
}

function ItemRow({ item, ctx }: { item: ItemReport; ctx: Ctx }) {
  const { namer } = ctx
  const names = useApp((s) => s.settings.names)
  const update = useApp((s) => s.updateSettings)
  const [editing, setEditing] = useState(false)
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
    <div id={`gear-${item.slot}`} className={cn('grid items-start gap-x-4 border-b border-line px-5 py-3 last:border-b-0 hover:bg-surface-2/50', COLS)}>
      <div className="flex min-w-0 items-start gap-3">
        <Tooltip
          content={`${slot.ru} · ${GRADES[item.grade].ru.toLowerCase()} · заточка +${item.item.enchant} · уровень предмета ${item.item.itemLevel}. Цвет подложки — грейд, как в игре.`}
        >
          <ItemIcon itemId={item.item.item} slot={item.slot} enchant={item.item.enchant} size={48} />
        </Tooltip>
        <div className="group min-w-0 pt-0.5">
          {editing ? (
            <input
              autoFocus
              defaultValue={custom ?? ''}
              placeholder={label.main}
              onBlur={(e) => saveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName((e.target as HTMLInputElement).value)
                if (e.key === 'Escape') setEditing(false)
              }}
              className="w-full rounded-md border border-line-strong bg-surface-3 px-2 py-0.5 text-[13px] outline-none focus:border-accent"
            />
          ) : (
            <Tooltip content="Нажмите, чтобы дать вещи своё название. Пустое поле — вернуть название из игры (или слота, если вещь неизвестна).">
              <button onClick={() => setEditing(true)} className="flex max-w-full items-start gap-1.5 text-left">
                <GradeText grade={item.grade} className="text-[13px] leading-snug font-semibold">
                  {label.main}
                </GradeText>
                <Pencil size={11} className="mt-1 shrink-0 text-ink-3 opacity-0 group-hover:opacity-100" />
              </button>
            </Tooltip>
          )}
          <div className="tnum mt-0.5 text-[11px] text-ink-3">
            {slot.ru} · ур. предмета {item.item.itemLevel}
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
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {item.manastones.map((m, i) => {
              const info = stoneInfo(m.stone)
              return (
                <VerdictChip
                  key={i}
                  verdict={m.verdict}
                  className="gap-1 py-0.5 pr-2 pl-0.5 text-[11px]"
                  tip={
                    <>
                      <b className="text-ink">{info.ru}</b>
                      <span className="block">
                        {namer.stat(m.stat).main}, сила строки {m.grade} из 3.
                      </span>
                      <span className="mt-1 block">
                        {verdictWhy(m.verdict, m.weight)} ({VERDICT_TEXT[m.verdict]})
                      </span>
                    </>
                  }
                >
                  <StoneIcon stoneId={m.stone} size={18} />
                  {namer.stat(m.stat).main}
                  <span className="opacity-60">{'•'.repeat(m.grade)}</span>
                </VerdictChip>
              )
            })}
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
