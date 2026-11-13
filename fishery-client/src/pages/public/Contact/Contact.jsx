import React from 'react';
import ContactHero from './components/ContactHero';
import ContactIntroduction from './components/ContactIntroduction ';
import ContactInformation from './components/ContactInformation';
import ContactForm from './components/ContactForm';
import LocationSection from './components/LocationSection';
import ContactCTA from './components/ContactCTA';

const Contact = () => {
    return (
      <div>
        <ContactHero />
        <ContactIntroduction />
        <ContactInformation />
        <ContactForm />
        <LocationSection/>
        <ContactCTA/>
      </div>
    );
};

export default Contact;