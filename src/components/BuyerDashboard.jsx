import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import './BuyerDashboard.css';
import ContactModal from './ContactModal';

function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const appQuery = query(
          collection(db, 'buyerApplications'),
          where('email', '==', currentUser.email)
        );
        const unsubscribeApp = onSnapshot(appQuery, (snapshot) => {
          if (!snapshot.empty) {
            setApplication(snapshot.docs[0].data());
          }
        });

        const listingsQuery = query(
          collection(db, 'savedListings'),
          where('userId', '==', currentUser.uid)
        );
        const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
          const listings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSavedListings(listings);
        });

        const messagesQuery = query(
          collection(db, 'messages'),
          where('sellerEmail', '==', currentUser.email)
        );
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages((prev) => {
            const newUnread = msgs.filter((msg) => !msg.read).length > prev.filter((msg) => !msg.read).length;
            if (newUnread) {
              setNewMessageAlert(true);
              setTimeout(() => setNewMessageAlert(false), 4000);
            }
            return msgs;
          });
        });

        return () => {
          unsubscribeApp();
          unsubscribeListings();
          unsubscribeMessages();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleRemoveListing = async (listingId) => {
    try {
      await deleteDoc(doc(db, 'savedListings', listingId));
      setSavedListings((prev) => prev.filter((item) => item.id !== listingId));
    } catch (error) {
      console.error('Error removing listing:', error);
      alert('Failed to remove listing.');
    }
  };

  const statusSteps = ['Submitted', 'Under Review', 'Approved'];
  const getStatusIndex = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 0;
      case 'under review':
        return 1;
      case 'approved':
        return 2;
      default:
        return 0;
    }
  };

  const isJustListed = (postedDate) => {
    if (!postedDate) return false;
    const posted = new Date(postedDate);
    const now = new Date();
    const diff = (now - posted) / (1000 * 60 * 60 * 24);
    return diff < 3;
  };

  const formatTimestamp = (ts) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleString();
  };

  const listingMap = savedListings.reduce((acc, listing) => {
    acc[listing.id] = listing.address;
    return acc;
  }, {});

  const groupedMessages = messages.reduce((acc, msg) => {
    const key = msg.listingId || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  const handleReply = async (msg) => {
    setReplyTo(msg);
    if (!msg.read) {
      try {
        await updateDoc(doc(db, 'messages', msg.id), { read: true });
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  return (
    <div className="buyer-dashboard">
      <h2>Welcome to Your Dashboard</h2>
      {user && <p className="greeting">Logged in as: {user.email}</p>}

      {newMessageAlert && <div className="toast">📨 New unread message received!</div>}

      <section className="dashboard-section">
        <h3>Your Application</h3>
        {application ? (
          <div className="application-card">
            <p><strong>Name:</strong> {application.name}</p>
            <p><strong>Location:</strong> {application.location}</p>
            <p><strong>Budget:</strong> ${application.budget}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className="status-badge">
                {application.status || 'Pending Review'}
              </span>
            </p>
            <div className="progress-bar">
              {statusSteps.map((step, index) => (
                <div
                  key={index}
                  className={`progress-step ${
                    index <= getStatusIndex(application.status) ? 'active' : ''
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No application found.</p>
        )}
      </section>

      <section className="dashboard-section">
        <h3>Saved Listings</h3>
        {savedListings.length > 0 ? (
          <div className="listing-grid">
            {savedListings.map((listing) => (
              <div key={listing.id} className="listing-card">
                {isJustListed(listing.postedDate) && (
                  <div className="just-listed-badge">Just Listed</div>
                )}
                <img src={listing.image || '/placeholder.jpg'} alt="Property" />
                <h4>{listing.address}</h4>
                <p>
                  ${listing.price}/mo · {listing.beds} Bed · {listing.baths} Bath
                </p>
                <button onClick={() => handleRemoveListing(listing.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved listings yet.</p>
        )}
      </section>

      <section className="dashboard-section">
        <h3>Messages from Buyers</h3>
        {Object.keys(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([listingId, msgs]) => (
            <div key={listingId} className="message-group">
              <h4>Listing: {listingMap[listingId] || 'Unspecified'}</h4>
              <ul className="message-list">
                {msgs.map((msg) => (
                  <li key={msg.id}>
                    <strong>{msg.senderName}</strong> ({msg.senderEmail})<br />
                    <em>{msg.message}</em><br />
                    <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                    {!msg.read && <span className="unread-badge">🔵 Unread</span>}
                    <button onClick={() => handleReply(msg)}>Reply</button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </section>

      {replyTo && (
        <ContactModal
          listingId={replyTo.listingId}
          sellerEmail={replyTo.senderEmail}
          sellerName={replyTo.senderName}
          onClose={() => setReplyTo(null)}
        />
      )}
    </div>
  );
}

export default BuyerDashboard;
