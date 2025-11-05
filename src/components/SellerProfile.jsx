import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import './SellerProfile.css';

function SellerProfile({ sellerId }) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'sellers', sellerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setProfile(docSnap.data());
    };

    const fetchReviews = async () => {
      const q = query(collection(db, 'reviews'), where('sellerId', '==', sellerId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setReviews(data);
    };

    fetchProfile();
    fetchReviews();
  }, [sellerId]);

  if (!profile) return <p>Loading seller profile...</p>;

  const avgRating = profile.rating?.toFixed(1) || 'N/A';

  return (
    <div className="seller-profile">
      <img src={profile.photoURL || '/placeholder.jpg'} alt="Seller" className="profile-photo" />
      <h2>{profile.name}</h2>
      <p>{profile.bio}</p>
      <p><strong>Specialties:</strong> {profile.specialties?.join(', ')}</p>
      <p><strong>Service Areas:</strong> {profile.serviceAreas?.join(', ')}</p>
      <p><strong>Rating:</strong> ⭐ {avgRating} ({profile.reviewCount} reviews)</p>

      <h3>Buyer Reviews</h3>
      <ul className="review-list">
        {reviews.map((r, i) => (
          <li key={i}>
            <strong>{r.buyerEmail}</strong> – ⭐ {r.rating}<br />
            <em>{r.comment}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
<FlagReview reviewId={review.id} />
{profile.rating >= 4.8 && <span className="badge">🌟 Top Seller</span>}
const filteredReviews = reviews.filter((r) => !r.flagged);
<ul className="review-list">
  {filteredReviews.map((r, i) => (
    <li key={i}>
      <strong>{r.buyerEmail}</strong> – ⭐ {r.rating}<br />
      <em>{r.comment}</em>
    </li>
  ))}
</ul>
{profile.responseRate >= 0.9 && <span className="badge">⚡ Fast Responder</span>}
{profile.transactions >= 10 && <span className="badge">🏅 Trusted Seller</span>}
{profile.responseRate >= 0.9 && <span className="badge">⚡ Fast Responder</span>}
<p><strong>Avg Response Time:</strong> {
  profile.responseRate >= 0.9 ? 'Under 1 hour' :
  profile.responseRate >= 0.8 ? 'Same day' :
  '1+ day'
}</p>
const avgSeconds = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
const avgHours = avgSeconds / 3600;

await sellerDoc.ref.update({
  responseRate: parseFloat(responseRate.toFixed(2)),
  avgResponseTime: parseFloat(avgHours.toFixed(1))
});

export default SellerProfile;
if (loading) return <p>Loading...</p>;
if (error) return <p>Error loading profile.</p>;
