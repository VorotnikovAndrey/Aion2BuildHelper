import { useLayoutEffect, useRef } from 'react'
import { createHashRouter, Route, RouterProvider, Routes, useLocation } from 'react-router'
import { Sidebar } from './layout/Sidebar'
import { ZoomToast } from './components/ZoomToast'
import { AetherBackdrop } from './components/fx'
import { Celebrations } from './components/Celebrations'
import { NoData } from './pages/NoData'
import { OverviewPage } from './pages/OverviewPage'
import { SkillsPage } from './pages/SkillsPage'
import { RotationPage } from './pages/RotationPage'
import { GearPage } from './pages/GearPage'
import { ArcanaPage } from './pages/ArcanaPage'
import { DaevanionPage } from './pages/DaevanionPage'
import { GenusPage } from './pages/GenusPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { StatsPage } from './pages/StatsPage'
import { HistoryPage } from './pages/HistoryPage'
import { TopPage } from './pages/TopPage'
import { GuidesPage } from './pages/GuidesPage'
import { GuideEditorPage } from './pages/GuideEditorPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { SettingsPage } from './pages/SettingsPage'
import { useCharacter } from './lib/store'

export function App() {
  return <RouterProvider router={router} />
}

const router = createHashRouter([{ path: '*', element: <Shell /> }])

function Shell() {
  const char = useCharacter()
  const location = useLocation()
  const main = useRef<HTMLElement>(null)
  // Новая страница открывается сверху.
  useLayoutEffect(() => {
    main.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="relative min-w-0 flex-1">
        <AetherBackdrop />
        <main ref={main} className="relative h-full overflow-x-hidden overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
          <div key={location.pathname} className="mx-auto max-w-[1280px] animate-fade-in px-8 py-7">
            <Routes>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/guides/:id/edit" element={<GuideEditorPage />} />
              {char ? (
                <>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/skills" element={<SkillsPage />} />
                  <Route path="/rotation" element={<RotationPage />} />
                  <Route path="/gear" element={<GearPage />} />
                  <Route path="/arcana" element={<ArcanaPage />} />
                  <Route path="/daevanion" element={<DaevanionPage />} />
                  <Route path="/genus" element={<GenusPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/top" element={<TopPage />} />
                  <Route path="/checklist" element={<ChecklistPage />} />
                </>
              ) : (
                <Route path="*" element={<NoData />} />
              )}
            </Routes>
          </div>
        </main>
      </div>
      <ZoomToast />
      <Celebrations />
    </div>
  )
}
