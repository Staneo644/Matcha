import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assumes react-router is used
import './Profile.css';

function UserProfile() {
  const { userId } = useParams(); // expects route like /user/:userId
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    // Fetch user profile
    fetch(`http://localhost:4567/user/${userId}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setIsLiked(data.isLiked);
        setIsConnected(data.isConnected);
        setIsBlocked(data.isBlocked);
        setIsOnline(data.isOnline);
        setLastSeen(data.lastSeen);
      })
      .catch(() => setMessage('Could not load profile.'));

    // Add to visit history
    fetch(`http://localhost:4567/visit/${userId}`, { method: 'POST', credentials: 'include' });
  }, [userId]);

  const handleLike = () => {
    fetch(`http://localhost:4567/likes/${userId}`, { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setIsLiked(true);
        setIsConnected(data.connected);
      });
  };

  const handleUnlike = () => {
    fetch(`http://localhost:4567/unlike/${userId}`, { method: 'POST', credentials: 'include' })
      .then(() => {
        setIsLiked(false);
        setIsConnected(false);
      });
  };

  const handleBlock = () => {
    fetch(`http://localhost:4567/block/${userId}`, { method: 'POST', credentials: 'include' })
      .then(() => setIsBlocked(true));
  };

  const handleUnblock = () => {
    fetch(`http://localhost:4567/unblock/${userId}`, { method: 'POST', credentials: 'include' })
      .then(() => setIsBlocked(false));
  };

  const handleReport = () => {
    fetch(`http://localhost:4567/report/${userId}`, { method: 'POST', credentials: 'include' })
      .then(() => alert('User reported as fake account.'));
  };

  if (message) return <div><div className="background"></div><div className="profile-container"><p className="message">{message}</p></div></div>;
  if (!profile) return <div><div className="background"></div><div className="profile-container"><p>Loading...</p></div></div>;

  return (
    <div>
      <div className="background"></div>
      <div className="profile-container">
        <h2>{profile.firstName} {profile.lastName}</h2>
        <div>
          <strong>Online status:</strong> {isOnline ? 'Online' : `Last seen: ${lastSeen || 'Unknown'}`}
        </div>
        <div><strong>Gender:</strong> {profile.gender}</div>
        <div><strong>Sexual Preferences:</strong> {profile.preferences}</div>
        <div><strong>Biography:</strong> {profile.bio}</div>
        <div>
          <strong>Interests:</strong> {profile.interests && profile.interests.length > 0
            ? profile.interests.join(', ')
            : 'None'}
        </div>
        <div>
          <strong>Pictures:</strong>
          <div className="profile-pictures">
            {profile.pictures && profile.pictures.length > 0 ? (
              profile.pictures.map((pic, idx) => (
                <img
                  key={idx}
                  src={pic}
                  alt={`Profile ${idx + 1}`}
                  style={{
                    border: idx === profile.profilePicIndex ? '2px solid #ff6f61' : '2px solid transparent',
                    width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', marginRight: 8
                  }}
                />
              ))
            ) : (
              <span>No pictures</span>
            )}
          </div>
        </div>
        <div><strong>Location:</strong> {profile.location}</div>
        <div><strong>Fame Rating:</strong> {profile.fame}</div>
        <div style={{ marginTop: 16 }}>
          {isBlocked ? (
            <button onClick={handleUnblock}>Unblock</button>
          ) : (
            <button onClick={handleBlock}>Block</button>
          )}
          <button onClick={handleReport} style={{ marginLeft: 8 }}>Report as Fake</button>
        </div>
        <div style={{ marginTop: 16 }}>
          {isLiked ? (
            <button onClick={handleUnlike}>Unlike</button>
          ) : (
            <button
              onClick={handleLike}
              disabled={profile.pictures.length === 0}
              title={profile.pictures.length === 0 ? "You need a profile picture to like" : ""}
            >
              Like
            </button>
          )}
          {isConnected && <span style={{ marginLeft: 8, color: 'green' }}>Connected!</span>}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;