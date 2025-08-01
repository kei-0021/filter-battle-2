// App.tsx
import { Route, Routes } from "react-router-dom";
import { Game } from "./pages/Game";
import { Title } from "./pages/Title";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Title />} />  
      <Route path="/game" element={<Game />} />
    </Routes>
  );
}

export default App;
