import React from 'react';
import { Link } from 'react-router-dom';
import ResumeData from './resume.json';
import './Homepage.css';

function Homepage() {
  const { firstname, lastname } = ResumeData.info;

  return (
    <div 
      className="homepage-wrapper"
      style={{
        backgroundImage: 'url(/IMG_8616.JPG)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="homepage-container">
        <h1 className="homepage-name">
          {firstname} {lastname}
        </h1>
        
        <p className="homepage-title">
          Software Engineer @ Amazon Ads. CS + AI @ UWaterloo.
        </p>

        <p className="homepage-bio">
          I build production-grade data platforms which empower users. Projects I've built from scratch have reached significant scale and visibility, including a performance analysis framework for Qualcomm and a campaign planning agent for Amazon.
        </p>

        <div className="homepage-links">
          <Link to="/portfolio" className="homepage-link">
            my 9-to-5 → 
          </Link>
          <Link to="/blog" className="homepage-link">
            my 5-to-9 → 
          </Link>
          <Link to="https://www.behance.net/abhij2706" className="homepage-link">
            after hours → 
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Homepage;

