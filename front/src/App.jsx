import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Survey from './pages/Survey'
import Innovation from './pages/Innovation'
import Traditional from './pages/Traditional'
import Portfolio from './pages/Portfolio'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/innovation" element={<Innovation />} />
      <Route path="/Traditional" element={<Traditional />} /> 
      <Route path="/portfolio" element={<Portfolio />} />
    </Routes>
  )
}

export default App
