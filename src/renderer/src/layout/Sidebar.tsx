import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { NavLink, useNavigate } from 'react-router'
import {
  ArrowDownCircle,
  BookOpen,
  ChevronDown,
  Gem,
  History,
  LayoutDashboard,
  Layers,
  ListChecks,
  PawPrint,
  RefreshCw,
  Repeat,
  Settings,
  Shirt,
  Sparkles,
  Swords,
  Trophy,
  Waypoints,
  type LucideIcon
} from 'lucide-react'
import { classInfo } from '@shared/gamedata/classes'
import { BrandMark } from '@/components/BrandMark'
import { CountUp } from '@/components/fx'
import { ClassIcon } from '@/components/game'
import { Tooltip } from '@/components/ui/InfoTip'
import { toneOfScore } from '@/components/ui/Pill'
import { ago, cn, compact } from '@/lib/format'
import { useAnimate } from '@/lib/motion'
import { useCharacterContext } from '@/lib/report'
import { api, useApp, useCharacters } from '@/lib/store'
import { useUpdates } from '@/lib/updates'
import { t } from '@shared/i18n'
import { term } from '@shared/names'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Что в разделе — подсказка при наведении. */
  tip: string
  score?: (s: NonNullable<ReturnType<typeof useCharacterContext>>['report']['scores']) => number
}

const NAV: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      {
        to: '/',
        label: t('Обзор'),
        icon: LayoutDashboard,
        tip: t('Персонаж целиком: оценка билда и список «что сделать дальше». Число — общий балл 0–100.'),
        score: (s) => s.overall
      }
    ]
  },
  {
    title: t('Билд'),
    items: [
      {
        to: '/skills',
        label: t('Умения'),
        icon: Swords,
        tip: t('Уровни умений против гайда, откуда они берутся и какие специализации нужны. Стигмы и пассивки.'),
        score: (s) => s.skills
      },
      {
        to: '/rotation',
        label: t('Ротация'),
        icon: Repeat,
        tip: t('Как играть: стопки умений для макроса, что жать вручную, начало боя и советы под вашего персонажа.')
      },
      { to: '/gear', label: t('Шмот'), icon: Shirt, tip: t('Каждая строка вещи и манакамни: что по гайду, что менять, что ловить.'), score: (s) => s.gear },
      { to: '/arcana', label: t('Арканы'), icon: Sparkles, tip: t('Пять карт: нужные умения, шансы заточки и новой карты, сеты.'), score: (s) => s.arcana },
      {
        to: '/daevanion',
        label: t('Даэванион'),
        icon: Waypoints,
        tip: t('Доски с отмеченными узлами, цели гайда и план прокачки по очкам.'),
        score: (s) => s.daevanion
      },
      {
        to: '/genus',
        label: t('Знание о видах'),
        icon: Layers,
        tip: t('Ячейки пяти родов: что как нужно, что перебросить и что ловить.'),
        score: (s) => s.genus
      }
    ]
  },
  {
    title: t('Персонаж'),
    items: [
      {
        to: '/collections',
        label: t('Питомцы и коллекции'),
        icon: PawPrint,
        tip: t('Питомцы и их уровни, крылья, титулы, облики, монолиты, персонажи аккаунта.')
      },
      { to: '/stats', label: t('Статы'), icon: Gem, tip: t('Полный лист характеристик с важностью по гайду и вкладом досок.') },
      { to: '/history', label: t('История'), icon: History, tip: t('График боевой мощи и лента изменений: заточки, вещи, уровни, узлы.') },
      {
        to: '/top',
        label: t('Сравнение с топом'),
        icon: Trophy,
        tip: t('Вы против тысяч топ-игроков класса: боевая мощь, умения, стигмы, заточка, арканы, доски — и где отставание больше всего.')
      }
    ]
  },
  {
    title: t('Цели'),
    items: [
      { to: '/guides', label: t('Гайды'), icon: BookOpen, tip: t('Выбор гайда, свои гайды, редактор, импорт и экспорт.') },
      { to: '/checklist', label: t('Чек-лист'), icon: ListChecks, tip: t('Вехи гайда (отмечаются сами), разовые дела, свои задачи и заметки.') }
    ]
  }
]

const DOT: Record<string, string> = { good: 'bg-good', warning: 'bg-warning', critical: 'bg-critical', neutral: 'bg-ink-3' }

export function Sidebar() {
  const ctx = useCharacterContext()
  const source = useApp((s) => s.source)
  const reload = useApp((s) => s.reload)
  const [spinning, setSpinning] = useState(false)
  const animate = useAnimate()
  // Свежие данные от оверлея — точка внизу коротко «пингует».
  const [fresh, setFresh] = useState(false)
  const lastModified = useRef(source?.modifiedAt)
  useEffect(() => {
    if (!source?.modifiedAt || source.modifiedAt === lastModified.current) return
    const first = lastModified.current === undefined
    lastModified.current = source.modifiedAt
    if (first) return
    setFresh(true)
    const t = setTimeout(() => setFresh(false), 4000)
    return () => clearTimeout(t)
  }, [source?.modifiedAt])

  const refresh = async () => {
    setSpinning(true)
    await reload()
    setTimeout(() => setSpinning(false), 500)
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <Logo />
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-wide">Aion2 Build Helper</div>
          <div className="text-[11px] text-ink-3">{t('помощник по билду')}</div>
        </div>
      </div>

      <CharacterSwitcher />

      <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-3">
        {NAV.map((group, gi) => (
          <div key={gi} className="mb-2">
            {group.title && <div className="px-2.5 pt-3 pb-1.5 text-[10.5px] font-semibold tracking-[0.12em] text-ink-3 uppercase">{group.title}</div>}
            {group.items.map((item) => {
              const score = ctx?.guide && item.score ? item.score(ctx.report.scores) : null
              return (
                <Tooltip
                  key={item.to}
                  block
                  content={
                    <>
                      {item.tip}
                      {score !== null && <span className="mt-1 block text-ink-3">{t('Оценка раздела по гайду: {score} из 100.', { score })}</span>}
                    </>
                  }
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                        isActive ? 'text-ink' : 'text-ink-2 hover:bg-surface hover:text-ink'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Подсветка активного раздела переезжает между пунктами. */}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 rounded-lg bg-accent-soft"
                            transition={animate ? { type: 'spring', stiffness: 520, damping: 40 } : { duration: 0 }}
                          >
                            <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-accent" />
                          </motion.span>
                        )}
                        <item.icon
                          size={16}
                          className={cn('relative transition-transform group-hover:scale-115', isActive ? 'text-accent' : 'text-ink-3 group-hover:text-ink-2')}
                        />
                        <span className="relative flex-1 truncate">{item.label}</span>
                        {score !== null && (
                          <span className="tnum relative flex items-center gap-1.5 text-[11px] text-ink-3">
                            <span className={cn('h-1.5 w-1.5 rounded-full', DOT[toneOfScore(score)])} />
                            <CountUp value={score} />
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <UpdateBanner />
        <Tooltip
          block
          content={t(
            'Приложение само следит за файлом оверлея Questlog. Здесь — когда файл обновился в последний раз. Нажмите, чтобы перечитать его прямо сейчас. Зелёная точка — файл найден, красная — нет.'
          )}
        >
          <button
            onClick={refresh}
            className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-ink-3 transition-colors hover:bg-surface hover:text-ink-2"
          >
            <RefreshCw size={14} className={cn(spinning && 'animate-spin')} />
            <span className="flex-1 truncate">
              {source?.exists ? (source.modifiedAt ? t('Данные: {ago}', { ago: ago(source.modifiedAt) }) : t('Данные загружены')) : t('Нет данных оверлея')}
            </span>
            <span className="relative flex h-2 w-2">
              {fresh && <span className="fx-ping absolute inset-0 rounded-full bg-good" />}
              <span className={cn('relative h-2 w-2 rounded-full', source?.exists && !source.error ? 'bg-good' : 'bg-critical')} />
            </span>
          </button>
        </Tooltip>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
              isActive ? 'bg-accent-soft text-ink' : 'text-ink-2 hover:bg-surface hover:text-ink'
            )
          }
        >
          <Settings size={16} className="text-ink-3" />
          {t('Настройки')}
        </NavLink>
        {ctx && (
          <div className="mt-2 truncate px-2.5 text-[11px] text-ink-3">
            {ctx.char.name} · {term(classInfo(ctx.char.cls), t('класс неизвестен'))} {t('· БМ {combatPower}', { combatPower: compact(ctx.char.combatPower) })}
          </div>
        )}
      </div>
    </aside>
  )
}

function CharacterSwitcher() {
  const chars = useCharacters()
  const ctx = useCharacterContext()
  const update = useApp((s) => s.updateSettings)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  if (!ctx) return null
  const { char } = ctx
  const info = classInfo(char.cls)
  return (
    <div className="relative px-3">
      <button
        onClick={() => chars.length > 1 && setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition-colors',
          chars.length > 1 && 'hover:border-line-strong'
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <ClassIcon cls={char.cls} size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{char.name}</span>
          <span className="block truncate text-[11px] text-ink-3">
            {term(info, '—')} {t('· ур. {level} · {server}', { level: char.level, server: char.server })}
          </span>
        </span>
        {chars.length > 1 && <ChevronDown size={14} className={cn('text-ink-3 transition-transform', open && 'rotate-180')} />}
      </button>
      {open && (
        <div className="absolute inset-x-3 top-full z-40 mt-1 animate-fade-in rounded-xl border border-line-strong bg-surface-2 p-1 shadow-xl shadow-black/50">
          {chars.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                void update({ activeCharacter: c.key })
                setOpen(false)
                navigate('/')
              }}
              className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-surface-3', c.key === char.key && 'bg-surface-3')}
            >
              <ClassIcon cls={c.cls} size={14} className="text-ink-3" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px]">{c.name}</span>
                <span className="block text-[11px] text-ink-3">
                  {term(classInfo(c.cls), '—')} {t('· ур. {level} · БМ {combatPower}', { level: c.level, combatPower: compact(c.combatPower) })}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Значок приложения — тот же, что у установщика и на заставке (BrandMark). */
export function Logo({ size = 34 }: { size?: number }) {
  return <BrandMark size={size} />
}

/** Новая версия скачивается или готова — коротко внизу меню, нажатие открывает «Настройки». */
function UpdateBanner() {
  const state = useUpdates((s) => s.state)
  const navigate = useNavigate()
  if (state.phase !== 'ready' && state.phase !== 'downloading') return null
  const ready = state.phase === 'ready'
  return (
    <Tooltip
      block
      content={
        ready
          ? t('Нажмите «Перезапустить и обновить» в настройках — или новая версия поставится сама при закрытии приложения.')
          : t('Новая версия скачивается в фоне.')
      }
    >
      <button
        onClick={() => (ready ? void api.updates.install() : navigate('/settings'))}
        className={cn(
          'mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
          ready ? 'bg-accent-soft text-ink hover:bg-accent/20' : 'text-ink-3 hover:bg-surface'
        )}
      >
        <ArrowDownCircle size={14} className={ready ? 'text-accent' : 'animate-pulse'} />
        <span className="flex-1 truncate">
          {ready
            ? t('Обновить до {version} — перезапуск', { version: state.version })
            : t('Скачиваю {p} · {p2}%', { p: state.version ?? t('обновление'), p2: Math.round((state.progress ?? 0) * 100) })}
        </span>
      </button>
    </Tooltip>
  )
}
