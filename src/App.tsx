// App.tsx
import { Route, Routes } from "react-router-dom";
import { Game } from "./pages/Game";
import { Title } from "./pages/Title";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Title onJoin={(n) => {
        console.log(n);
        window.location.href = "/game"; // 仮遷移
      }} />} />  
      <Route path="/game" element={<Game />} />
    </Routes>
  );
}

export default App;
