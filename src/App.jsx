import { Routes, Route, Navigate } from 'react-router-dom'
import { TourProvider } from './lib/tour'
import Tour from './components/Tour/Tour'
import Navigation from './components/shared/Navigation'
import DemoBanner from './components/shared/DemoBanner'
import Footer from './components/shared/Footer'
import Home from './components/Home/Home'
import Search from './components/Search/Search'
import Deploy from './components/Deploy/Deploy'
import Supplier from './components/Supplier/Supplier'
import Tonight from './components/Tonight/Tonight'
import Live from './components/Live/Live'

export default function App() {
  return (
    <TourProvider>
      <div className="min-h-screen flex flex-col">
        <DemoBanner />
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/live" element={<Live />} />
            <Route path="/tonight" element={<Tonight />} />
            <Route path="/hotels" element={<Supplier />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Tour />
    </TourProvider>
  )
}
