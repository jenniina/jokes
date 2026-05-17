import { Route, Routes } from 'react-router-dom'
import JokesPage from '../../pages/JokesPage'
import UserEditPage from '../../pages/UserEditPage'
import Disclaimer from '../Disclaimer/Disclaimer'

const MainWrapper = () => {
  return (
    <main id="main-content" className="main-content z">
      <Routes>
        <Route path="/" element={<JokesPage type="page" />} />
        <Route path="/edit" element={<UserEditPage type="page" />} />
        <Route path="/info" element={<Disclaimer type="page" />} />
        <Route path="*" element={<JokesPage type="page" />} />
      </Routes>
    </main>
  )
}

export default MainWrapper
