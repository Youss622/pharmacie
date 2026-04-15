import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Stocks() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ product_id: '', name: '', stock: 0, lot: '', expiry_date: '', price: 0, currency: 'GNF' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    api.get('products/').then(res => setProducts(res.data)).catch(console.error);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      product_id: product.product_id,
      name: product.name,
      stock: product.stock,
      lot: product.lot,
      expiry_date: product.expiry_date,
      price: product.price,
      currency: product.currency || 'GNF'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) {
      try {
        await api.delete(`products/${id}/`);
        loadProducts();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`products/${editingId}/`, formData);
      } else {
        await api.post('products/', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ product_id: '', name: '', stock: 0, lot: '', expiry_date: '', price: 0, currency: 'GNF' });
      loadProducts();
    } catch (err) {
      const errorDetail = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
      alert("Détail de l'erreur : " + errorDetail);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ product_id: '', name: '', stock: 0, lot: '', expiry_date: '', price: 0, currency: 'GNF' });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Stocks</h1>
        <button onClick={() => showForm ? handleCancel() : setShowForm(true)}>
          {showForm ? 'Annuler' : '+ Nouveau Produit'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem'}}>{editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
            <div style={{flex: '1 1 200px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Réf / Code</label>
              <input type="text" value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} required disabled={editingId ? true : false} />
            </div>
            <div style={{flex: '1 1 300px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Nom complet</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div style={{flex: '1 1 100px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>En Stock</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
            </div>
            <div style={{flex: '1 1 100px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Prix Unitaire</label>
              <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
            </div>
            <div style={{flex: '1 1 100px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Devise</label>
              <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                <option value="GNF">GNF</option>
                <option value="FCFA">FCFA</option>
                <option value="$">($)</option>
              </select>
            </div>
            <div style={{flex: '1 1 150px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Numéro de Lot</label>
              <input type="text" value={formData.lot} onChange={e => setFormData({...formData, lot: e.target.value})} required />
            </div>
            <div style={{flex: '1 1 200px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Date d'Expiration</label>
              <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} required />
            </div>
            <div style={{width: '100%', marginTop: '1rem'}}>
              <button type="submit" style={{background: editingId ? 'var(--secondary)' : 'var(--primary)'}}>{editingId ? 'Mettre à jour' : 'Sauvegarder le Produit'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {products.length === 0 ? <p>Le stock est vide. Veuillez ajouter des produits.</p> : (
          <table>
            <thead>
              <tr>
                <th>Réf</th>
                <th>Produit</th>
                <th>Stock</th>
                <th>Prix</th>
                <th>Lot</th>
                <th>Péremption</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.product_id}</strong></td>
                  <td>{p.name}</td>
                  <td>
                    <span style={{ color: p.stock <= 10 ? 'var(--danger)' : 'inherit', fontWeight: p.stock <= 10 ? 600 : 400}}>
                      {p.stock} {p.stock <= 10 && '⚠️'}
                    </span>
                  </td>
                  <td>{p.price} {p.currency}</td>
                  <td>{p.lot}</td>
                  <td>{new Date(p.expiry_date).toLocaleDateString()}</td>
                  <td>
                    <button style={{background: '#10B981', padding: '0.4rem 0.8rem', marginRight: '0.5rem', fontSize: '0.85rem'}} onClick={() => handleEdit(p)}>Modifier</button>
                    <button style={{background: '#EF4444', padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => handleDelete(p.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
