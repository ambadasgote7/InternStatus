import { BrowserRouter, Route, Routes } from "react-router-dom"
import Body from "./components/Body"
import Login from "./components/auth/Login"


function App() {
 

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Body/>}>
          <Route path='/login' element={<Login/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
