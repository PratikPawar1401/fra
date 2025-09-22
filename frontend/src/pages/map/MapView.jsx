import React from 'react';
import MapContainer from '../../components/map/MapContainer';
import Loading from '../../components/common/Loading';
import VillageDataInfo from '../../components/map/VillageDataInfo';

const MapView = () => {
  return (
    <div className="relative h-full w-full">
      <React.Suspense fallback={<Loading />}>
        {/* <VillageDataInfo /> */}
        <MapContainer />
      </React.Suspense>
    </div>
  );
};

export default MapView;