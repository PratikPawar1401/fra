import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import MapView from './pages/map/MapView';
import Landing from './pages/landing/Landing';
import Upload from './pages/upload/UploadPage';
import DigitalLibrary from './pages/library/DigitalLibrary';
import './App.css';

function App() {
  return (
    <MapProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/library" element={<DigitalLibrary />} />
            <Route path="/" element={<Landing />} />
          </Routes>
        </Layout>
      </Router>
    </MapProvider>
  );
}

export default App;