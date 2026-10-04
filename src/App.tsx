import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomeScreen } from './screens/home/HomeScreen';
import { FavoritesScreen } from './screens/favorites/FavoritesScreen';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/favorites" element={<FavoritesScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
