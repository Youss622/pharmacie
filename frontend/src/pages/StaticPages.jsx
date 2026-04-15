import React from 'react';
import api from '../api';

export function ComptaFallback() {
    return <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}><h1>Livre Comptable Global</h1><p style={{color: 'var(--text-muted)', marginTop:'1rem', lineHeight:'1.5'}}>Le Grand Livre comptable consolidé. Veuillez utiliser "Recette", "Dépenses" et "Bilan" dans le menu à gauche pour des vues thématiques isolées et interactives.</p></div>;
}

export function RecetteFallback() {
    return <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}><h1>Gestion des Recettes</h1><p style={{color: 'var(--text-muted)', marginTop:'1rem', lineHeight:'1.5'}}>Actuellement automatisée via le module de Vente (Caisse). Les recettes exceptionnelles externes seront administrables à la prochaine mise à jour.</p></div>;
}

export function RapportsFallback() {
    return (
        <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}>
            <h1 style={{marginBottom: '2rem'}}>Rapports PDF & Excel <span style={{fontSize:'1rem', color:'var(--primary)'}}>(En préparation)</span></h1>
            <p style={{marginBottom: '2rem', color: 'var(--text-muted)'}}>Sélectionnez un type de rapport officiel à imprimer pour les Autorités, l'Inspecteur de Santé, ou votre Expert-comptable.</p>
            <div style={{display:'flex', gap:'15px'}}>
                <button style={{background:'white', color:'var(--danger)', border:'1px solid var(--danger)'}}>📄 Bilan Financier Mensuel</button>
                <button style={{background:'white', color:'var(--blue)', border:'1px solid var(--blue)'}}>📄 Rapport d'Inventaire (Drogues)</button>
            </div>
        </div>
    );
}

export function UtilisateursFallback() {
    return <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}><h1>Contrôle des Utilisateurs 🔐</h1><p style={{color: 'var(--text-muted)', marginTop:'1rem', lineHeight:'1.5'}}>Fonctionnalité strictement réservée au super-administrateur (Le Gestionnaire de la Pharmacie Mega Pro). Accès via le panel privé Django de niveau 0.</p></div>;
}

export function ParametresFallback() {
    const [password, setPassword] = React.useState('');
    const [showPrompt, setShowPrompt] = React.useState(false);
    
    const [pharmacyName, setPharmacyName] = React.useState(localStorage.getItem('pharmacyName') || '');
    const [pharmacyLogo, setPharmacyLogo] = React.useState(localStorage.getItem('pharmacyLogo') || '');

    const handleSaveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('pharmacyName', pharmacyName);
        localStorage.setItem('pharmacyLogo', pharmacyLogo);
        alert("✔️ Paramètres de la pharmacie mis à jour avec succès.\nL'application va recharger pour appliquer le nouveau nom/logo.");
        window.location.reload();
    };
    
    const handlePurge = (e) => {
        e.preventDefault();
        api.post('admin/purge/', { password: password }).then(() => {
            alert("🔥 SUCCÈS : Base de données réinitialisée à zéro. Toutes les données métiers ont été vidées. Vous pouvez maintenant insérer vos vraies données.");
            setShowPrompt(false);
            setPassword('');
        }).catch(err => {
            alert("❌ Accès Refusé : Mot de passe Super Administrateur incorrect.");
        });
    };

    return (
      <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}>
        <h1>Administration Centrale (Super Administrateur)</h1>
        <p style={{color: 'var(--text-muted)', marginTop:'1rem', lineHeight:'1.5', marginBottom:'2rem'}}>
          Configuration Générale de la Pharmacie. Branding et Paramétrage de la Base de Données.
        </p>

        <div style={{padding:'2rem', border:'1px solid var(--border)', borderRadius:'12px', marginBottom:'2rem'}}>
            <h3 style={{marginBottom:'1.5rem'}}>🎨 Personnalisation de l'Interface</h3>
            <form onSubmit={handleSaveSettings} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                <div>
                    <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem', fontWeight:'bold'}}>Nom de la Pharmacie</label>
                    <input type="text" placeholder="Ex: Pharmacie Mega Pro" value={pharmacyName} onChange={e=>setPharmacyName(e.target.value)} style={{width:'100%', maxWidth:'400px'}} />
                </div>
                <div>
                    <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem', fontWeight:'bold'}}>URL du Logo de la Pharmacie (Lien image)</label>
                    <input type="url" placeholder="https://..." value={pharmacyLogo} onChange={e=>setPharmacyLogo(e.target.value)} style={{width:'100%', maxWidth:'400px'}} />
                    {pharmacyLogo && <img src={pharmacyLogo} alt="Aperçu logo" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'8px', marginLeft:'15px', verticalAlign:'middle'}} />}
                </div>
                <button type="submit" style={{width: 'fit-content'}}>Enregistrer Nom & Logo</button>
            </form>
        </div>
        
        <div style={{padding:'2rem', border:'2px dashed var(--danger)', borderRadius:'12px', background:'#fef2f2'}}>
            <h3 style={{color:'var(--danger)', marginBottom:'1rem'}}>⚠️ ZONE DE DANGER (SUPER ADMINISTRATEUR)</h3>
            <p style={{marginBottom:'1.5rem'}}>Ce module vous permet de vider l'intégralité de la base de données (Stocks, Clients, Factures, Salaires, Dépenses) pour faire un "Factory Reset".</p>
            
            {!showPrompt ? (
               <button className="badge badge-red" style={{border:'none', fontSize:'0.9rem', padding:'0.6rem 1rem'}} onClick={() => { if(window.confirm("Attention: Vous allez lancer la procédure de purge de la Base de Données. Confirmer la navigation vers le verrou ?")) setShowPrompt(true); }}>
                  🔥 VIDER TOUTE LA BASE DE DONNÉES
               </button>
            ) : (
               <form onSubmit={handlePurge} style={{display:'flex', gap:'10px', marginTop:'1rem', flexWrap:'wrap'}}>
                  <input type="password" placeholder="Mot de Passe (admin)" value={password} onChange={e=>setPassword(e.target.value)} required style={{border:'2px solid var(--danger)'}} autoFocus />
                  <button type="submit" style={{background:'var(--danger)', color:'white'}}>Confirmer l'Effacement</button>
                  <button type="button" onClick={()=>setShowPrompt(false)} style={{background:'#9CA3AF', color:'white', border:'none'}}>Annuler</button>
               </form>
            )}
        </div>
      </div>
    );
}

export function AideFallback() {
    return <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}><h1>Centre de Sécurité & d'Aide 🩺</h1><p style={{color: 'var(--text-muted)', marginTop:'1rem', lineHeight:'1.5'}}>Pour toute anomalie réseau ou aide fonctionnelle, veuillez adresser un ticket d'assistance immédiat à l'Équipe Ingénierie.</p></div>;
}

export function ManuelFallback() {
    return <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}><h1>Manuel d'Utilisation Officiel 📘</h1><p style={{color: 'var(--text-muted)', marginTop:'1rem', lineHeight:'1.5'}}>Le manuel officiel interactif de la version ERP V2 (Avril 2026) est en cours de structuration. Il inclura des images et vidéos tutoriels pour les pharmaciens remplaçants.</p></div>;
}

export function AproposFallback() {
    return (
        <div className="glass-panel" style={{padding: '3rem', margin: '2rem'}}>
            <h1 style={{marginBottom: '1rem'}}>À Propos de Pharmacie Mega Pro ✨</h1>
            <p style={{color: 'var(--text-muted)', lineHeight:'1.8'}}>
                <strong>Version :</strong> V2.0.0 (Enterprise Resource Planning - Edition Conakry)<br/>
                <strong>Génération System :</strong> Avril 2026.<br/>
                <strong>Infrastructure :</strong> React Vite 18 (Frontend), Django Py (Backend API), MySQL Core.<br/>
                <strong>Licence :</strong> Propriétaire. Toute duplication ou falsification de ce logiciel administratif est interdite.
            </p>
        </div>
    );
}
