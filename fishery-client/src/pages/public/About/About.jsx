import React from 'react';
import AboutHero from './components/AboutHero';
import WhoWeAre from './components/WhoWeAre';
import OurApproach from './components/OurApproach';
import AboutOperations from './components/AboutOperations';
import AboutLake from './components/AboutLake';
import OurCommitment from './components/OurCommitment';

const About = () => {
  return (
    <section>
      <AboutHero />
      <WhoWeAre />
      <OurApproach />
      <AboutOperations />
      <AboutLake />
      <OurCommitment />
    </section>
  );
};

export default About;