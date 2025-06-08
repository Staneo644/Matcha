import React, { useEffect, useState } from 'react';
import './Profile.css';

function About() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4567/profile', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(() => setMessage('Could not load profile.'));
  }, []);

  if (message) return <div><div className="background"></div><div className="profile-container"><p className="message">{message}</p></div></div>;
  if (!profile) return <div><div className="background"></div><div className="profile-container"><p>Loading...</p></div></div>;

  return (
    <div>
      <div className="background"></div>
      <div className="profile-container">
        <h2>Your Profile</h2>
        <div><strong>First Name:</strong> {profile.firstName}</div>
        <div><strong>Last Name:</strong> {profile.lastName}</div>
        <div><strong>Email:</strong> {profile.email}</div>
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
        <div><strong>Viewed by:</strong> {profile.viewers && profile.viewers.length > 0 ? profile.viewers.join(', ') : 'No views yet'}</div>
        <div><strong>Liked by:</strong> {profile.likers && profile.likers.length > 0 ? profile.likers.join(', ') : 'No likes yet'}</div>
      </div>
    </div>
  );
}

export default About;