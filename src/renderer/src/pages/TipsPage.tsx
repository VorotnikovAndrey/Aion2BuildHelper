// «Советы автора»: всё, что автор гайда написал словами — о билде, о целевой стадии (заметка, умения и ротация,
// доски) и о других стадиях. Пункт меню виден, только если в выбранном гайде такие тексты есть.

import { useNavigate } from 'react-router'
import { Lightbulb } from 'lucide-react'
import { t } from '@shared/i18n'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { TipItem, tipsFor } from '@/components/GuideTips'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, PageHeader } from '@/components/ui/misc'
import { useCharacterContext } from '@/lib/report'

export function TipsPage() {
  const ctx = useCharacterContext()!
  const navigate = useNavigate()
  const { char, baseGuide, stage } = ctx
  const all = baseGuide?.tips ?? []
  const stages = baseGuide?.stages
  const general = all.filter((x) => !x.stages)
  const current = stage ? tipsFor(baseGuide, stage).filter((x) => x.stages) : []
  const others = all.filter((x) => x.stages && !current.includes(x))

  return (
    <>
      <PageHeader
        icon={<Lightbulb size={22} />}
        title={t('Советы автора')}
        subtitle={t(
          'Что автор гайда пишет словами: о билде, о стадиях, об умениях и ротации, о досках. Текст — как у автора (у билдов Questlog обычно по-английски).'
        )}
        actions={<GuideSwitcher char={char} />}
      />
      {!baseGuide || !all.length ? (
        <EmptyState
          title={t('В этом гайде нет советов')}
          action={
            <Button variant="primary" onClick={() => navigate('/guides')}>
              {t('Выбрать гайд')}
            </Button>
          }
        >
          {t('Автор не написал к билду ни описания, ни заметок. Советы есть у многих билдов Questlog — их видно в списке гайдов.')}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="min-w-0 space-y-5">
            {stage && current.length > 0 && (
              <Card
                title={t('Целевая стадия: {stage}', { stage: stage.name })}
                hint={t('Заметки автора к стадии, которая сейчас выбрана целью: сама стадия, умения и ротация, доски.')}
              >
                <div className="space-y-4">
                  {current.map((x, i) => (
                    <TipItem key={x.id ?? i} tip={x} />
                  ))}
                </div>
              </Card>
            )}
            {general.length > 0 && (
              <Card title={general.some((x) => x.kind) ? t('О билде') : t('Советы гайда')} hint={t('Общее описание гайда — к любой стадии.')}>
                <div className="space-y-4">
                  {general.map((x, i) => (
                    <TipItem key={x.id ?? i} tip={x} />
                  ))}
                </div>
              </Card>
            )}
          </div>
          {others.length > 0 && (
            <Card title={t('Другие стадии')} hint={t('Заметки автора к стадиям, которые сейчас не выбраны целью.')}>
              <div className="space-y-4">
                {others.map((x, i) => (
                  <TipItem key={x.id ?? i} tip={x} stages={stages} />
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  )
}
