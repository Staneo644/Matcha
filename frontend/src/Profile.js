import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Navbar from './Navbar';
import DOMPurify from 'dompurify';

function Profile() {
  const [profile, setProfile] = useState({
    gender: '',
    orientation: '',
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
    likers: []
  });
  
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newPicture, setNewPicture] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  
  const allTags = ['#vegan', '#geek', '#piercing', '#music', '#sports', '#travel', '#art', '#foodie'];
  
  useEffect(() => {
    fetchProfile();
    fetchViewers();
    fetchLikers();
  }, []);
  
  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setProfile(prevProfile => ({
            ...prevProfile,
            ...data
          }));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to load profile data.');
      });
  };
  
  const fetchViewers = () => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/profile/viewers', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          setProfile(prevProfile => ({
            ...prevProfile,
            viewers: data.viewers || []
          }));
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  const fetchLikers = () => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/profile/likers', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          setProfile(prevProfile => ({
            ...prevProfile,
            likers: data.likers || []
          }));
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  const handleTagClick = (tag) => {
    if (!profile.interests.includes(tag)) {
      setProfile({
        ...profile,
        interests: [...profile.interests, tag]
      });
    } else {
      setProfile({
        ...profile,
        interests: profile.interests.filter(t => t !== tag)
      });
    }
  };
  
  const handleAddTag = () => {
    if (newTag && !profile.interests.includes(newTag)) {
      const formattedTag = newTag.startsWith('#') ? newTag : `#${newTag}`;
      setProfile({
        ...profile,
        interests: [...profile.interests, formattedTag]
      });
      setNewTag('');
    }
  };
  
  const handlePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewPicture(e.target.files[0]);
    }
  };
  
  const handleUploadPicture = () => {
    if (!newPicture) return;
    
    if (profile.pictures.length >= 5) {
      setMessage('You can only upload up to 5 pictures.');
      return;
    }
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('picture', newPicture);
    
    fetch('http://localhost:4567/upload-picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setProfile({
            ...profile,
            pictures: [...profile.pictures, data.url]
          });
          setNewPicture(null);
          setMessage('Picture uploaded successfully.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to upload picture.');
      });
  };
  
  const handleSetProfilePic = (index) => {
    setProfile({
      ...profile,
      profilePicIndex: index
    });
  };
  
  const handleDeletePicture = (index) => {
    const token = localStorage.getItem('token');
    const pictureUrl = profile.pictures[index];
    
    fetch(`http://localhost:4567/delete-picture`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: pictureUrl }),
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          const newPictures = [...profile.pictures];
          newPictures.splice(index, 1);
          
          let newProfilePicIndex = profile.profilePicIndex;
          if (index === profile.profilePicIndex) {
            newProfilePicIndex = 0;
          } else if (index < profile.profilePicIndex) {
            newProfilePicIndex--;
          }
          
          setProfile({
            ...profile,
            pictures: newPictures,
            profilePicIndex: newProfilePicIndex
          });
          setMessage('Picture deleted successfully.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to delete picture.');
      });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Sanitize data
    const sanitizedProfile = {
      ...profile,
      bio: DOMPurify.sanitize(profile.bio),
      firstName: DOMPurify.sanitize(profile.firstName),
      lastName: DOMPurify.sanitize(profile.lastName),
      email: DOMPurify.sanitize(profile.email),
      location: DOMPurify.sanitize(profile.location)
    };
    
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/update-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sanitizedProfile),
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage('Profile updated successfully.');
          setEditing(false);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to update profile.');
      });
  };
  
  const handleLogout = () => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const viewUserProfile = (userId) => {
    navigate(`/user/${userId}`);
  };
  
  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-header">
          <h1>{profile.firstName} {profile.lastName}</h1>
          <div className="fame-rating">
            <span>Fame Rating: {profile.fame}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'viewers' ? 'active' : ''} 
            onClick={() => setActiveTab('viewers')}
          >
            Profile Viewers
          </button>
          <button 
            className={activeTab === 'likers' ? 'active' : ''} 
            onClick={() => setActiveTab('likers')}
          >
            Likes
          </button>
        </div>
        
        {activeTab === 'profile' && (
          <div className="profile-content">
            {!editing ? (
              <div className="profile-info">
                <div className="profile-pictures">
                  {profile.pictures.length > 0 ? (
                    <div className="main-picture">
                      <img 
                        src={profile.pictures[profile.profilePicIndex]} 
                        alt="Profile" 
                      />
                    </div>
                  ) : (
                    <div className="no-picture">
                      <p>No profile picture</p>
                    </div>
                  )}
                  
                  <div className="picture-thumbnails">
                    {profile.pictures.map((pic, index) => (
                      <div 
                        key={index} 
                        className={`thumbnail ${index === profile.profilePicIndex ?
                        'active' : ''}`}
                        onClick={() => handleSetProfilePic(index)}
                      >
                        <img src={pic} alt={`Profile ${index + 1}`} />
                        {index === profile.profilePicIndex && <span>Profile Pic</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="profile-details">
                  <div className="detail">
                    <span>First Name:</span>
                    <span>{profile.firstName}</span>
                  </div>
                  <div className="detail">
                    <span>Last Name:</span>
                    <span>{profile.lastName}</span>
                  </div>
                  <div className="detail">
                    <span>Email:</span>
                    <span>{profile.email}</span>
                  </div>
                  <div className="detail">
                    <span>Gender:</span>
                    <span>{profile.gender}</span>
                  </div>
                  <div className="detail">
                    <span>Orientation:</span>
                    <span>{profile.orientation}</span>
                  </div>
                  <div className="detail">
                    <span>Biography:</span>
                    <span>{profile.bio}</span>
                  </div>
                  <div className="detail">
                    <span>Interests:</span>
                    <div className="interests">
                      {profile.interests.map(tag => (
                        <span key={tag} className="interest-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="detail">
                    <span>Location:</span>
                    <span>{profile.location}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-edit">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      value={profile.firstName} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName" 
                      value={profile.lastName} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={profile.email} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender:</label>
                    <select 
                      id="gender" 
                      name="gender" 
                      value={profile.gender} 
                      onChange={handleChange} 
                      required 
                    >
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="orientation">Orientation:</label>
                    <select 
                      id="orientation" 
                      name="orientation" 
                      value={profile.orientation} 
                      onChange={handleChange} 
                      required 
                    >
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="both">Both</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bio">Biography:</label>
                    <textarea 
                      id="bio" 
                      name="bio" 
                      value={profile.bio} 
                      onChange={handleChange} 
                      maxLength={500} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="interests">Interests:</label>
                    <div className="interests-input">
                      <input 
                        type="text" 
                        id="newTag" 
                        value={newTag} 
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTag();
                            e.preventDefault();
                          }
                        }}
                        placeholder="Add a new tag"
                      />
                      <button type="button" onClick={handleAddTag}>Add Tag</button>
                    </div>
                    <div className="interests">
                      {allTags.map(tag => (
                        <button 
                          key={tag} 
                          className={profile.interests.includes(tag) ? 'selected-tag' : ''}
                          onClick={() => handleTagClick(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">Location:</label>
                    <input 
                      type="text" 
                      id="location" 
                      name="location" 
                      value={profile.location} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPicture">Upload New Picture:</label>
                    <input 
                      type="file" 
                      id="newPicture" 
                      name="newPicture" 
                      accept="image/*" 
                      onChange={handlePictureChange}
                    />
                    <button type="button" onClick={handleUploadPicture}>Upload</button>
                  </div>
                  <div className="form-group">
                    <label htmlFor="deletePicture">Delete Picture:</label>
                    <select 
                      id="deletePicture" 
                      name="deletePicture" 
                      onChange={(e) => handleDeletePicture(parseInt(e.target.value))}
                    >
                      <option value="">Select a picture to delete</option>
                      {profile.pictures.map((pic, index) => (
                        <option key={index} value={index}>
                          Picture {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'viewers' && (
          <div className="profile-viewers">
            <h2>Profile Viewers</h2>
            {profile.viewers.length > 0 ? (
              <div className="viewers-list">
                {profile.viewers.map(viewer => (
                  <div key={viewer.id} className="viewer">
                    <img 
                      src={viewer.profilePicture || '/default-profile.png'} 
                      alt="Viewer Profile" 
                    />
                    <div className="viewer-info">
                      <h3>{viewer.firstName} {viewer.lastName}</h3>
                      <p>Viewed on: {formatDate(viewer.viewedAt)}</p>
                    </div>
                    <button 
                      className="view-profile-button" 
                      onClick={() => viewUserProfile(viewer.id)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No viewers yet.</p>
            )}
          </div>
        )}
        
        {activeTab === 'likers' && (
          <div className="profile-likers">
            <h2>Likes</h2>
            {profile.likers.length > 0 ? (
              <div className="likers-list">
                {profile.likers.map(liker => (
                  <div key={liker.id} className="liker">
                    <img 
                      src={liker.profilePicture || '/default-profile.png'} 
                      alt="Liker Profile" 
                    />
                    <div className="liker-info">
                      <h3>{liker.firstName} {liker.lastName}</h3>
                      <p>Liked on: {formatDate(liker.likedAt)}</p>
                    </div>
                    <button 
                      className="view-profile-button" 
                      onClick={() => viewUserProfile(liker.id)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No likes yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
