import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import Placeholder from './pages/Placeholder';
import Fournisseurs from './pages/Fournisseurs';
import Ordonnances from './pages/Ordonnances';
import Livraison from './pages/Livraison';
import Assurances from './pages/Assurances';
import Depenses from './pages/Depenses';
import Salaires from './pages/Salaires';
import Bilan from './pages/Bilan';
import { 
  ComptaFallback, RecetteFallback, RapportsFallback, 
  UtilisateursFallback, ParametresFallback, AideFallback, 
  ManuelFallback, AproposFallback 
} from './pages/StaticPages';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const navClass = (path) => location.pathname === path ? "sidebar-link active" : "sidebar-link";

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', flexWrap:'wrap' }}>
          {localStorage.getItem('pharmacyLogo') ? (
               <img src={localStorage.getItem('pharmacyLogo')} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border:'1px solid var(--border)' }} />
          ) : (
               <div style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>⚕️</div>
          )}
          <div>
            <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.9rem', wordBreak: 'break-word' }}>{localStorage.getItem('pharmacyName') || 'Méga Pro'}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Solution ERP V2</div>
          </div>
        </div>
        
        <div className="sidebar-section">PRINCIPAL</div>
        <Link to="/" className={navClass('/')}><span className="dot green"></span> Tableau de bord</Link>
        <Link to="/ordonnances" className={navClass('/ordonnances')}><span className="dot blue"></span> Ordonnances</Link>
        <Link to="/sales" className={navClass('/sales')}><span className="dot orange"></span> Caisse / Ventes</Link>
        <Link to="/stocks" className={navClass('/stocks')}><span className="dot lightblue"></span> Stock et inventaire</Link>
        <Link to="/clients" className={navClass('/clients')}><span className="dot purple"></span> Clients</Link>

        <div className="sidebar-section">OPÉRATIONS</div>
        <Link to="/fournisseurs" className={navClass('/fournisseurs')}><span className="dot green"></span> Fournisseurs</Link>
        <Link to="/livraison" className={navClass('/livraison')}><span className="dot green"></span> Livraison</Link>
        <Link to="/alertes" className={navClass('/alertes')}><span className="dot red"></span> Alertes & Réceptions</Link>
        <Link to="/assurances" className={navClass('/assurances')}><span className="dot blue"></span> Assurances</Link>

        <div className="sidebar-section">ADMINISTRATION</div>
        <Link to="/compta" className={navClass('/compta')}><span className="dot orange"></span> Comptabilité</Link>
        <Link to="/recette" className={navClass('/recette')}><span className="dot red"></span> Recette</Link>
        <Link to="/depenses" className={navClass('/depenses')}><span className="dot red"></span> Dépenses</Link>
        <Link to="/salaires" className={navClass('/salaires')}><span className="dot blue"></span> Salaire / Personnels</Link>
        <Link to="/bilan" className={navClass('/bilan')}><span className="dot blue"></span> Bilan</Link>
        <Link to="/rapports" className={navClass('/rapports')}><span className="dot blue"></span> Rapports & Dashboards</Link>
        <Link to="/utilisateurs" className={navClass('/utilisateurs')}><span className="dot gray"></span> Utilisateurs</Link>
        <Link to="/parametres" className={navClass('/parametres')}><span className="dot dark"></span> Paramètres</Link>

        <div className="sidebar-section">SUPPORT</div>
        <Link to="/aide" className={navClass('/aide')}><span className="dot green"></span> Aide</Link>
        <Link to="/manuel" className={navClass('/manuel')}><span className="dot light"></span> Manuel d'utilisation</Link>
        <Link to="/apropos" className={navClass('/apropos')}><span className="dot light"></span> À propos de...</Link>

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button onClick={handleLogout} style={{ width: '100%', background: 'var(--danger)', fontSize: '0.8rem' }}>Déconnexion</button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/clients" element={<Clients />} />
              
              <Route path="/ordonnances" element={<Ordonnances />} />
              <Route path="/fournisseurs" element={<Fournisseurs />} />
              <Route path="/livraison" element={<Livraison />} />
              <Route path="/alertes" element={<Placeholder title="Alertes et Réceptions" />} />
              <Route path="/assurances" element={<Assurances />} />
              <Route path="/compta" element={<ComptaFallback />} />
              <Route path="/recette" element={<RecetteFallback />} />
              <Route path="/depenses" element={<Depenses />} />
              <Route path="/salaires" element={<Salaires />} />
              <Route path="/bilan" element={<Bilan />} />
              <Route path="/rapports" element={<RapportsFallback />} />
              <Route path="/utilisateurs" element={<UtilisateursFallback />} />
              <Route path="/parametres" element={<ParametresFallback />} />
              <Route path="/aide" element={<AideFallback />} />
              <Route path="/manuel" element={<ManuelFallback />} />
              <Route path="/apropos" element={<AproposFallback />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
