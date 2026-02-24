import React from 'react';
import Carousel from './Carousel';

const TvSection = ({ title, fetchURL, rowId, filterFn }) => {
  return (
    <Carousel
      title={title}
      fetchUrl={fetchURL}
      mediaType="tv"
      filterFn={filterFn}
    />
  );
};

export default TvSection;
