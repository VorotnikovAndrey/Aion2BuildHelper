// Настройки → «Язык»: язык интерфейса (смена перезагружает окно) и язык игровых названий.

import { useState } from 'react'
import { Check, Gamepad2, Languages } from 'lucide-react'
import { getLocale, LOCALES, t, type LocaleInfo } from '@shared/i18n'
import { classSkills } from '@shared/gamedata/skills'
import { createNamer, gameLangOf, type NameMode } from '@shared/names'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { Segmented } from '@/components/ui/misc'
import { cn } from '@/lib/format'
import { changeLanguage } from '@/lib/language'
import { useApp } from '@/lib/store'

/** Умение для примера названий: «Суд» стража — есть и по-русски, и по-английски. */
const SAMPLE = classSkills('templar').find((s) => s.en === 'Judgment') ?? classSkills('templar')[0]

export function LanguageSection() {
  const nameMode = useApp((s) => s.settings.nameMode)
  const update = useApp((s) => s.updateSettings)
  const [pending, setPending] = useState<string | null>(null)
  const current = getLocale()
  const sample = SAMPLE ? createNamer(nameMode).skill(SAMPLE.id) : null

  return (
    <div className="space-y-5">
      <Card
        title={t('Язык интерфейса')}
        hint={t('Окно перезагрузится на выбранном языке — данные и настройки останутся. Перевод интерфейса сделан помощником.')}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {LOCALES.map((l) => (
            <LanguageButton
              key={l.id}
              info={l}
              active={l.id === current}
              busy={pending === l.id}
              onClick={() => {
                setPending(l.id)
                void changeLanguage(l.id)
              }}
            />
          ))}
        </div>
      </Card>

      <Card
        title={t('Игровые названия')}
        hint={t(
          'Умения, статы, вещи и классы называются официальными названиями из клиента игры. В справочниках приложения сейчас есть русские и английские; для других языков интерфейса — английские.'
        )}
      >
        <Segmented<NameMode>
          value={nameMode}
          onChange={(mode) => void update({ nameMode: mode })}
          items={[
            { id: 'both', label: t('Как интерфейс + английские') },
            { id: 'local', label: t('Как интерфейс') },
            { id: 'ru', label: t('Русские') },
            { id: 'en', label: t('Английские') }
          ]}
        />
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs leading-relaxed text-ink-3">
          <Gamepad2 size={13} className="shrink-0" />
          {t('Сейчас: {lang}.', { lang: gameLangOf(nameMode) === 'ru' ? 'Русский' : 'English' })}
          {sample && (
            <span>
              {t('Пример:')} <b className="font-medium text-ink-2">{sample.main}</b>
              {sample.alt && <span className="ml-1 text-[11px]">({sample.alt})</span>}
            </span>
          )}
        </p>
      </Card>
    </div>
  )
}

function LanguageButton({ info, active, busy, onClick }: { info: LocaleInfo; active: boolean; busy: boolean; onClick: () => void }) {
  return (
    <Tooltip
      block
      content={
        info.game
          ? t('Клиент игры есть на этом языке. Официальные игровые названия в приложении пока только русские и английские — выбор ниже.')
          : t('Клиента игры на этом языке нет. Игровые названия — официальные английские или русские, выбор ниже.')
      }
    >
      <button
        onClick={onClick}
        disabled={active || busy}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
          active ? 'border-accent bg-accent-soft' : 'border-line bg-surface-2/50 hover:border-line-strong hover:bg-surface-2'
        )}
      >
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', active ? 'bg-accent text-on-accent' : 'bg-surface-3 text-ink-3')}>
          {active ? <Check size={16} strokeWidth={3} /> : <Languages size={15} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-ink" lang={info.id}>
            {info.name}
          </span>
          <span className="block truncate text-[11px] text-ink-3">{busy ? t('Переключаю…') : info.game ? t('язык клиента игры') : t('клиента игры нет')}</span>
        </span>
      </button>
    </Tooltip>
  )
}
