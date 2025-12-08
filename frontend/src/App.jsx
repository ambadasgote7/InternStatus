import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/auth/Login";
import appStore from "./utils/appStore";
import { Provider } from "react-redux";
import Signup from "./components/auth/Signup";


function App() {
 

  return (
    <div>
      <Provider store={appStore}> 
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Body/>}>
            <Route path='/signup' element={<Signup/>} />
            <Route path='/login' element={<Login/>} />
            </Route>
          </Routes>
      </BrowserRouter>
      </Provider>
      
    </div>
  )
}

export default App
