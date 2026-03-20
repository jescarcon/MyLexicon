import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './components/pages/index'

function App() {

  return (
    <BrowserRouter>

      <div className="app-container">

        <div className="content">
          <Routes>
            <Route path="/" element={<Index />} />

          </Routes>

        </div>

      </div>
    </BrowserRouter>
  )
}

export default App
