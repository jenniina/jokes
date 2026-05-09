import { Route, Routes } from 'react-router-dom'
import JokesPage from '../../pages/JokesPage'

const MainWrapper = () => {
  return (
    <main id="main-content" className="main-content z">
      <Routes>
        <Route path="/" element={<JokesPage type="page" />} />
        <Route path="*" element={<JokesPage type="page" />} />
      </Routes>
    </main>
  )
}

export default MainWrapper
