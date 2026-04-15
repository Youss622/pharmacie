import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, cliRes] = await Promise.all([
        api.get('products/'),
        api.get('clients/')
      ]);
      setProducts(prodRes.data);
      setClients(cliRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrage intelligent (Nom ou Lot)
  const filteredProducts = searchQuery.trim().length > 0 
      ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.lot && p.lot.toLowerCase().includes(searchQuery.toLowerCase())))
      : [];

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if(existing) {
        setCart(cart.map(item => item.product.id === product.id ? {...item, qty: item.qty + 1} : item));
    } else {
        setCart([...cart, { product: product, qty: 1, discount: 0 }]);
    }
    setSearchQuery(""); // Réinitialiser la recherche après ajout
  };

  const updateCartItem = (id, field, value) => {
    setCart(cart.map(item => item.product.id === id ? { ...item, [field]: value } : item));
  };

  const removeFromCart = (id) => {
      setCart(cart.filter(item => item.product.id !== id));
  };

  const totalCart = cart.reduce((sum, item) => sum + (item.product.price * item.qty) - item.discount, 0);

  const handleCheckout = async () => {
      if(cart.length === 0) return alert("Le panier est vide.");
      setIsProcessing(true);

      try {
          // Génération d'Identifiant de Format Vente-Jour
          // Ex: CMD-20260414-999
          const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
          const rand = Math.floor(Math.random() * 900) + 100;
          const invoiceId = `VTE-${today}-${rand}`;

          // 1. Créer indépendamment chaque élément vendu
          const salePromises = cart.map(item => api.post('sales/', {
             sale_id: `SALE-${invoiceId}-${item.product.id}`,
             product: item.product.id,
             client: selectedClient || null,
             quantity_sold: item.qty,
             total_price: (item.product.price * item.qty) - item.discount
          }));

          const saleResults = await Promise.all(salePromises);
          const saleIds = saleResults.map(res => res.data.id);

          // 2. Créer la Facture unifiée globale
          await api.post('invoices/', {
             invoice_id: invoiceId,
             sales: saleIds,
             total_amount: totalCart,
             status: 'Validée'
          });

          // 3. Injecter l'argent en "Recette" dans le système (automatisé par simplification ou via endpoint spécifique plus tard)
          
          alert(`✅ VENTE VALIDÉE AVEC SUCCÈS !\nN° de Facture : ${invoiceId}`);
          setCart([]);
          setSelectedClient("");
      } catch(err) {
          alert("Erreur lors de la facturation. Vérifiez le serveur.");
          console.error(err);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div>
      <div className="page-header" style={{borderBottom:'1px solid var(--border)', paddingBottom:'1rem'}}>
        <h1 className="page-title">Caisse Multimédicaments Pôle N°1</h1>
        <div style={{fontSize:'1.5rem', fontWeight:'900', color:'var(--primary)'}}>{totalCart} GNF</div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'minmax(0, 1.2fr) minmax(0, 2fr)', gap:'2rem', marginTop:'2rem'}}>
          
          {/* Bloc de Recherche et Ajout Rapide */}
          <div>
              <div className="glass-panel" style={{position:'relative', zIndex: 10}}>
                  <h3 style={{marginBottom:'1rem'}}>Recherche & Scan</h3>
                  <input 
                      type="text" 
                      placeholder="🔍 Scanner Code-barre ou Taper le nom du Médicament..." 
                      style={{width:'100%', padding:'1rem', fontSize:'1.1rem'}}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                  />
                  
                  {filteredProducts.length > 0 && (
                      <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid var(--border)', borderRadius:'0 0 12px 12px', boxShadow:'0 10px 15px rgba(0,0,0,0.1)', maxHeight:'300px', overflowY:'auto'}}>
                          {filteredProducts.map(p => (
                              <div key={p.id} onClick={() => addToCart(p)} style={{padding:'1rem', borderBottom:'1px solid #f3f4f6', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                  <div>
                                      <div style={{fontWeight:'bold'}}>{p.name}</div>
                                      <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Lot : {p.lot || 'N/A'} | En Stock : {p.stock} unités | Exp. {p.expiry_date}</div>
                                  </div>
                                  <div style={{fontWeight:'900', color:'var(--primary)'}}>{p.price}</div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="glass-panel" style={{marginTop:'2rem'}}>
                  <h3 style={{marginBottom:'1rem'}}>Client Rattaché (Optionnel)</h3>
                  <select value={selectedClient} onChange={e=>setSelectedClient(e.target.value)} style={{width:'100%', padding:'0.8rem'}}>
                      <option value="">-- Client de Passage (Anonyme) --</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                  </select>
              </div>
          </div>

          {/* Bloc Panier et Facturation */}
          <div className="glass-panel">
              <h3 style={{marginBottom:'1.5rem', display:'flex', justifyContent:'space-between'}}>
                  <span>Panier des Articles</span>
                  <span className="badge badge-purple">{cart.length} Articles</span>
              </h3>
              
              {cart.length === 0 ? <p style={{color:'var(--text-muted)', textAlign:'center', margin:'3rem 0'}}>Le panier est vide. Cherchez un médicament pour l'ajouter.</p> : (
                  <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                      {cart.map(item => (
                          <div key={item.product.id} style={{display:'flex', gap:'1rem', alignItems:'center', background:'#f8fafc', padding:'1rem', borderRadius:'8px', border:'1px solid var(--border)'}}>
                              <div style={{flex: 1}}>
                                  <div style={{fontWeight:'bold'}}>{item.product.name}</div>
                                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Prix base : {item.product.price}</div>
                              </div>
                              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                                  <label style={{fontSize:'0.75rem', fontWeight:'bold'}}>Qté:</label>
                                  <input type="number" min="1" max={item.product.stock} value={item.qty} onChange={(e) => updateCartItem(item.product.id, 'qty', parseInt(e.target.value) || 1)} style={{width:'60px', padding:'0.3rem'}} />
                              </div>
                              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                                  <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--danger)'}}>Remise :</label>
                                  <input type="number" min="0" value={item.discount} onChange={(e) => updateCartItem(item.product.id, 'discount', parseFloat(e.target.value) || 0)} style={{width:'80px', padding:'0.3rem', borderColor:'var(--danger)'}} />
                              </div>
                              <div style={{fontWeight:'900', color:'var(--primary)', width:'80px', textAlign:'right'}}>
                                  {(item.product.price * item.qty) - item.discount}
                              </div>
                              <button onClick={() => removeFromCart(item.product.id)} style={{background:'white', border:'None', color:'var(--danger)', fontSize:'1.2rem', padding:'0 5px', cursor:'pointer'}}>×</button>
                          </div>
                      ))}
                      
                      <div style={{borderTop:'2px dashed var(--border)', paddingTop:'1rem', marginTop:'1rem'}}>
                          <div style={{display:'flex', justifyContent:'space-between', fontSize:'1.2rem', fontWeight:'bold'}}>
                              <span>TOTAL À ENCAISSER :</span>
                              <span style={{color:'var(--primary)'}}>{totalCart} GNF</span>
                          </div>
                      </div>

                      <button onClick={handleCheckout} disabled={isProcessing} style={{marginTop:'1.5rem', padding:'1rem', fontSize:'1.1rem', background:'var(--primary)'}}>
                          {isProcessing ? 'Génération de la facture...' : '💳 ENCAISSER ET VALIDER LA VENTE'}
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
