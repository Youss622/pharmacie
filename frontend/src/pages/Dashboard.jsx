import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState({
    kpis: { vente_jour: 0, vente_hier: 0, ordo_jour: 0, clients_mois: 0, alertes: 0 },
    chart: [],
    stocks: []
  });

  useEffect(() => {
    api.get('analytics/dashboard/')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">ADM DE LA STRUCTURE</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Pharmacie Centrale • Conakry, Guinée • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-green"><span className="dot green"></span> Pharmacie ouverte</span>
          <span className="badge badge-red">{data.kpis.alertes} alertes critiques</span>
          <span className="badge badge-purple">Période : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#fef3c7' }}>💰</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vente du jour</p>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem' }}>{data.kpis.vente_jour}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GNF <span style={{ color: 'var(--primary)' }}>vs {data.kpis.vente_hier} hier</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#f1f5f9' }}>📋</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mouvements (Ordo)</p>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem' }}>{data.kpis.ordo_jour}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>aujourd'hui</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#eff6ff' }}>👥</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clients distincts</p>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem' }}>{data.kpis.clients_mois}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ce mois</div>
        </div>
        <div className="kpi-card" style={{ border: data.kpis.alertes > 0 ? '1px solid #fca5a5' : '1px solid var(--border)' }}>
          <div className="kpi-card-icon" style={{ background: data.kpis.alertes > 0 ? '#fef2f2' : '#f8fafc' }}>🔔</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alertes critiques</p>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem', color: data.kpis.alertes > 0 ? 'var(--danger)' : 'var(--text-main)' }}>{data.kpis.alertes}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>à traiter urgemment</div>
        </div>
      </div>

      <div className="section-label">CAISSE / VENTES & ALERTES MULTIPLES</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.2fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Ventes Stats */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Ventes / semaine</h3>
            <span className="badge badge-blue" style={{background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '0.2rem 0.6rem'}}>Dynamique</span>
          </div>
          <div style={{ height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="uv" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <h3 style={{ fontSize: '0.95rem', marginTop: '2rem', marginBottom: '1rem' }}>Ventes / catégories (Fixe Image)</h3>
          {[
            { tag: 'Médicaments', pct: 76, color: 'var(--primary)' },
            { tag: 'Parapharmacie', pct: 13, color: 'var(--blue)' },
            { tag: 'Disp. médicaux', pct: 7, color: 'var(--purple)' },
            { tag: 'Compléments', pct: 4, color: 'var(--warning)' }
          ].map(c => (
            <div key={c.tag} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ width: '120px' }}>{c.tag}</span>
              <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '4px', margin: '0 10px' }}>
                <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: '4px' }}></div>
              </div>
              <span style={{ width: '40px', textAlign: 'right', fontWeight: 'bold' }}>{c.pct}%</span>
            </div>
          ))}
        </div>

        {/* Alertes Multiples */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Alertes multiples</h3>
            <span className="badge badge-red" style={{background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.2rem 0.6rem'}}>Alertes</span>
          </div>
          
          {data.stocks.length === 0 ? <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Aucune alerte médicale.</p> : null}
          
          {data.stocks.slice(0, 4).map(p => (
            <div key={p.id} style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
              <div style={{ color: p.color, fontSize: '1.2rem' }}>{p.status === 'Critique' ? '🔴' : '⚠️'}</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.name} — {p.status}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.stock} exemplaires restants</div>
              </div>
            </div>
          ))}
          
          <div style={{ display: 'flex', gap: '15px', background: '#eff6ff', padding: '0.8rem', borderRadius: '8px' }}>
            <div style={{ color: 'var(--blue)', fontSize: '1.2rem' }}>ℹ️</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Information Magasin</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Système synchronisé avec succès.</div>
            </div>
          </div>
        </div>

        {/* Stock Critique */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Stock critique Live</h3>
            <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Réel</span>
          </div>
          
          {data.stocks.length === 0 ? <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Aucune rupture imminente.</p> : null}
          
          {data.stocks.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ width: '130px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.stock} unités</div>
              </div>
              <div style={{ width: '40px', height: '4px', background: '#f1f5f9', borderRadius: '4px' }}>
                <div style={{ width: s.width, height: '100%', background: s.color, borderRadius: '4px' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', padding: '0.1rem 0.6rem', border: `1px solid ${s.color}`, color: s.color, borderRadius: '99px', fontWeight: 'bold', width: '70px', textAlign: 'center' }}>
                {s.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comptabilité */}
      <div className="section-label">COMPTABILITÉ — VUES STATIQUES (Exemple Design)</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Recettes</h3>
            <span className="badge badge-green" style={{ border: 'none' }}>Mois en cours</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '2rem' }}>34 820 000 <span style={{ fontSize: '0.8rem' }}>GNF</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <span>SOURCE</span><span>MONTANT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>Ventes comptoir</span><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>27 300 000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>Parapharmacie</span><span style={{ color: 'var(--text-muted)' }}>4 200 000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>Remboursements</span><span style={{ color: 'var(--text-muted)' }}>3 320 000</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Dépenses</h3>
            <span className="badge badge-red" style={{ border: 'none' }}>Mois en cours</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--danger)', marginBottom: '2rem' }}>21 450 000 <span style={{ fontSize: '0.8rem' }}>GNF</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <span>CATÉGORIE</span><span>MONTANT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>Achats fournisseurs</span><span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>14 500 000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>Loyer + charges</span><span style={{ color: 'var(--text-muted)' }}>2 150 000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>Salaires + divers</span><span style={{ color: 'var(--text-muted)' }}>4 800 000</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Situation salaires</h3>
            <span className="badge badge-purple" style={{ border: 'none' }}>Avril 2026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <span>EMPLOYÉ</span><span>STATUT</span>
          </div>
          {['Aissatou Bah', 'Ibrahim Kourouma', 'Mariama Sow', 'Oumar Sylla', 'Assiatou Diallo'].map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <span>{e}</span>
              <span className={`badge-solid ${i===2||i===3 ? 'badge-solid-yellow' : 'badge-solid-blue'}`} style={{background: i===2||i===3 ? '#fef3c7' : '#ecfdf5', color: i===2||i===3 ? '#d97706' : '#10b981'}}>
                {i===2||i===3 ? 'Non payé' : 'Payé'}
              </span>
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Comptabilité bilan</h3>
            <span className="badge badge-green" style={{ border: '1px solid #10b981' }}>Dont</span>
          </div>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recette du mois</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1rem' }}>34 820 000 GNF</div>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dépense du mois</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--danger)', marginBottom: '2rem' }}>21 450 000 GNF</div>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bénéfice net</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1rem' }}>13 370 000 GNF</div>
          
          <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 'bold', background: '#fef3c7', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>
            TVA à reverser : 1 862 000 GNF
          </div>
        </div>
      </div>
    </div>
  );
}
