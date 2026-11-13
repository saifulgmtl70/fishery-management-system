import React from 'react';
import FisheryHero from './components/FisheryHero';
import FarmOverview from './components/FarmOverview';
import PondManagement from './components/PondManagement';
import FishProduction from './components/FishProduction';
import HarvestingProcess from './components/HarvestingProcess';
import WholesaleSupply from './components/WholesaleSupply';
import LakeOperations from './components/LakeOperations';
import FisheryCTA from './components/FisheryCTA';

const Fishery = () => {
  return (
    <div>
      <FisheryHero />
      <FarmOverview />
      <PondManagement />
      <FishProduction />
      <HarvestingProcess />
      <WholesaleSupply />
      <LakeOperations />
      <FisheryCTA />
    </div>
  );
};

export default Fishery;