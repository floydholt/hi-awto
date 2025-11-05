import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

function SellerLeaderboard() {
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    const fetchTopSellers = async () => {
      const q = query(collection(db, 'sellers'), orderBy('rating', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const sellers = snapshot.docs.map(doc => doc.data());
      setTopSellers(sellers);
    };
    fetchTopSellers();
  }, []);

  return (
    <div>
      <h2>🏆 Top Rated Sellers</h2>
      <ul>
        {topSellers.map((s, i) => (
          <li key={i}>
            <strong>{s.name}</strong> – ⭐ {s.rating.toFixed(1)} ({s.reviewCount} reviews)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SellerLeaderboard;
