import React, { useEffect, useState, useRef } from 'react';
import { StackCard } from 'react-stack-cards'; // <-- Correct import
import './Profile.css';

const sortOptions = [
  { value: 'age', label: 'Age' },
  { value: 'location', label: 'Location' },
  { value: 'fame', label: 'Fame Rating' },
  { value: 'tags', label: 'Common Tags' },
];

function Browse() {
  const [profiles, setProfiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sortBy, setSortBy] = useState('location');
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    minFame: '',
    maxFame: '',
    location: '',
    tags: '',
  });

  const ref = useRef();

  // Fetch suggestions from backend
  useEffect(() => {
    // fetch('http://localhost:4567/suggestions', { credentials: 'include' })
    //   .then(res => res.json())
    //   .then(data => {
    //     setProfiles(data);
    //     setFiltered(data);
    //   });
  }, []);

  // Filtering logic
  useEffect(() => {
    let result = profiles;

    // Age gap
    if (filters.minAge)
      result = result.filter(p => p.age >= Number(filters.minAge));
    if (filters.maxAge)
      result = result.filter(p => p.age <= Number(filters.maxAge));

    // Fame rating gap
    if (filters.minFame)
      result = result.filter(p => p.fame >= Number(filters.minFame));
    if (filters.maxFame)
      result = result.filter(p => p.fame <= Number(filters.maxFame));

    // Location
    if (filters.location)
      result = result.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );

    // Multiple tags (comma-separated, must match ALL)
    if (filters.tags) {
      const tags = filters.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      if (tags.length > 0) {
        result = result.filter(p =>
          tags.every(tag =>
            p.interests.map(t => t.toLowerCase()).includes(tag)
          )
        );
      }
    }

    setFiltered(result);
  }, [filters, profiles]);

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'age': return a.age - b.age;
      case 'location': return a.location.localeCompare(b.location);
      case 'fame': return b.fame - a.fame;
      case 'tags': return (b.commonTags || 0) - (a.commonTags || 0);
      default: return 0;
    }
  });

  // Handle filter input
  const handleFilter = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle swipe
  const onSwipe = (direction, profile) => {
    setFiltered(prev => prev.filter(p => p.id !== profile.id));
    // Optionally send like/pass to backend here
  };

  return (
    <div>
      <div className="background"></div>
      <div className="profile-container">
        <h2>Browse Suggestions</h2>
        <div style={{ marginBottom: 16 }}>
          <label>Sort by: </label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Filter controls */}
        <div style={{ marginBottom: 16 }}>
          <div>
            <label>Age gap: {filters.minAge || 18} - {filters.maxAge || 99}</label>
            <input
              type="range"
              name="minAge"
              min="18"
              max={filters.maxAge || 99}
              value={filters.minAge || 18}
              onChange={handleFilter}
              style={{ width: 120, marginRight: 8 }}
            />
            <input
              type="range"
              name="maxAge"
              min={filters.minAge || 18}
              max="99"
              value={filters.maxAge || 99}
              onChange={handleFilter}
              style={{ width: 120 }}
            />
          </div>
          <div>
            <label>Fame gap: {filters.minFame || 0} - {filters.maxFame || 100}</label>
            <input
              type="range"
              name="minFame"
              min="0"
              max={filters.maxFame || 100}
              value={filters.minFame || 0}
              onChange={handleFilter}
              style={{ width: 120, marginRight: 8 }}
            />
            <input
              type="range"
              name="maxFame"
              min={filters.minFame || 0}
              max="100"
              value={filters.maxFame || 100}
              onChange={handleFilter}
              style={{ width: 120 }}
            />
          </div>
          <div>
            <label>Location: </label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilter}
              placeholder="Enter location"
            />
          </div>
          <div>
            <label>Tags (comma separated): </label>
            <input
              type="text"
              name="tags"
              value={filters.tags}
              onChange={handleFilter}
              placeholder="e.g. music, art"
            />
          </div>
        </div>
        <div style={{ width: 300, height: 400, margin: '0 auto' }}>
          <StackCard
            ref={ref}
            items={sorted.map(profile => (
              <div key={profile.id} className="profile-card">
                <img src={profile.avatar} alt={profile.username} style={{ width: '100%' }} />
                <h3>{profile.username}</h3>
                <p>Age: {profile.age}</p>
                <p>Location: {profile.location}</p>
                <p>Fame: {profile.fame}</p>
                <p>Tags: {profile.interests.join(', ')}</p>
              </div>
            ))}
            direction="right"
            onEnd={() => { /* handle end of stack */ }}
          />
        </div>
      </div>
    </div>
  );
}

export default Browse;