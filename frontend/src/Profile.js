import React, { useState, useEffect } from 'react';
import './Profile.css'; // Add custom styles here

const defaultProfile = {
  gender: '',
  preferences: '',
  bio: '',
  interests: [],
  pictures: [],
  profilePicIndex: 0,
  lastName: '',
  firstName: '',
  email: '',
  location: '',
  fame: 0,
  viewers: [],
  likers: [],
};

const allTags = ['#vegan', '#geek', '#piercing', '#music', '#sports', '#travel', '#art', '#foodie'];

function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [newInterest, setNewInterest] = useState('');
  const [pictureFiles, setPictureFiles] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch profile data, viewers, likers, and fame rating from backend on mount
  useEffect(() => {
    // TODO: Fetch profile, viewers, likers, and fame from backend
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle interest tag add
  const handleAddInterest = (tag) => {
    if (!profile.interests.includes(tag) && profile.interests.length < 10) {
      setProfile({ ...profile, interests: [...profile.interests, tag] });
    }
  };

  // Handle interest tag remove
  const handleRemoveInterest = (tag) => {
    setProfile({ ...profile, interests: profile.interests.filter(i => i !== tag) });
  };

  // Handle picture upload
  const handlePictureChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPictureFiles(files);
    setProfile({ ...profile, pictures: files.map(file => URL.createObjectURL(file)) });
  };

  // Set profile picture
  const setProfilePic = (idx) => {
    setProfile({ ...profile, profilePicIndex: idx });
  };

  // Handle location update (simulate GPS)
  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setProfile({ ...profile, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        },
        () => setMessage('Unable to retrieve your location.')
      );
    } else {
      setMessage('Geolocation is not supported by your browser.');
    }
  };

  // Handle profile save
  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Send updated profile to backend
    setMessage('Profile saved!');
  };

  return (
	<div>
      <div className="background"></div>
      <div className="profile-container">
        <h2>Your Profile</h2>
        <form onSubmit={handleSave}>
          <label>
            First Name:
            <input name="firstName" value={profile.firstName} onChange={handleChange} />
          </label>
          <label>
            Last Name:
            <input name="lastName" value={profile.lastName} onChange={handleChange} />
          </label>
          <label>
            Email:
            <input name="email" value={profile.email} onChange={handleChange} />
          </label>
          <label>
            Gender:
            <select name="gender" value={profile.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Sexual Preferences:
            <select name="preferences" value={profile.preferences} onChange={handleChange}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="both">Both</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Biography:
            <textarea name="bio" value={profile.bio} onChange={handleChange} maxLength={500} />
          </label>
          <label>
            Interests:
            <div>
              {allTags.map(tag => (
                <button
                  type="button"
                  key={tag}
                  className={profile.interests.includes(tag) ? 'selected-tag' : ''}
                  onClick={() => profile.interests.includes(tag) ? handleRemoveInterest(tag) : handleAddInterest(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div>
              Selected: {profile.interests.map(tag => <span key={tag}>{tag} </span>)}
            </div>
          </label>
          <label>
            Pictures (max 5):
            <input type="file" accept="image/*" multiple onChange={handlePictureChange} />
            <div className="profile-pictures">
              {profile.pictures.map((pic, idx) => (
                <div key={idx} className="profile-pic-thumb">
                  <img
                    src={pic}
                    alt={`Profile ${idx + 1}`}
                    style={{
                      border: idx === profile.profilePicIndex ? '2px solid #ff6f61' : '2px solid transparent',
                      width: 60, height: 60, objectFit: 'cover', borderRadius: '50%'
                    }}
                    onClick={() => setProfilePic(idx)}
                  />
                  {idx === profile.profilePicIndex && <span>Profile Pic</span>}
                </div>
              ))}
            </div>
          </label>
          <label>
            Location:
            <input name="location" value={profile.location} onChange={handleChange} />
            <button type="button" onClick={handleLocation}>Use GPS</button>
          </label>
          <button type="submit">Save Profile</button>
        </form>
        {message && <p className="message">{message}</p>}
        <div className="profile-extra">
          <h3>Fame Rating: {profile.fame}</h3>
          <div>
            <strong>Viewed by:</strong> {profile.viewers.join(', ') || 'No views yet'}
          </div>
          <div>
            <strong>Liked by:</strong> {profile.likers.join(', ') || 'No likes yet'}
          </div>
        </div>
      </div>
	  </div>

  );
}

export default Profile;