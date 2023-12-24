import React, { Fragment, useState, useEffect } from 'react';
import Map, {Source, Layer} from 'react-map-gl';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import accessibility from 'highcharts/modules/accessibility';

import 'mapbox-gl/dist/mapbox-gl.css';

accessibility(Highcharts);

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2prb25vcGthIiwiYSI6ImNscWZzcWd3NjEyMjIyaXFmZ3lzZDB6cGMifQ.GvJTjQf3TiTrvsUTdURoiw'; // Set your mapbox token here       
 
export function createNameLabel(shid) {
  // shid format puts the name at the end preded by a :
  // the type, neighborhood or tract, is immediately before that
  const parts = shid.split('/');
  const typeAndId = parts[parts.length-1].split(':');
  const type = typeAndId[0];
  const id = typeAndId[1];

  switch (type) {
    case 'tract':
      return `Tract: ${id}`;
    case 'neighborhood':
      return `Neighborhood: ${id.replace(/_/g, ' ')}`;
    default:
      return '';
  }
};

export function createChartOptions(selectedFeatures) {
  // used chatGPT to help format dataSeries input for highchart
  const categories = ['drive_alone', 'drive_carpool', 'public_transit', 'walk'];
  const dataSeries = selectedFeatures.map((feature) => {
    const shid = feature.properties.shid;
    const commuteData = categories.map((category) => feature.properties[`pop-commute-${category}`]);
    return [shid, ...commuteData];
  });

  return {
    chart: {
      type: 'bar',
      height: '300px',
      accessibility: {
        description: 'Bar chart displaying commuter populations in selected regions, broken down by type of commute',
      },
    },
    title: {
      text: 'Commuter Populations in Selected Regions',
    },
    xAxis: {
      categories: categories,
      title: {
        text: 'Commute type',
      },
    },
    yAxis: {
      title: {
        text: 'Number of Commuters',
      },
    },
    series: dataSeries.map((data) => ({
      // shid is the first entry in data, use it for name and remove it for commuter data
    name: createNameLabel(data[0]),
      data: data.slice(1),
      // Keep color consistancy with map colors
      color: data[0].includes('tract') > 0 ? '#800000' : '#808080',
    })),
  };
}

function App() {
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [kcNeighborhoods, setKcNeighborhoods] = useState(null);
  const [kcTracts, setKcTracts] = useState(null);

  const chartOptions = createChartOptions(selectedFeatures)

  // empty dependancy array so data isn't constantly re-fetched
  useEffect(() => {
    const fetchGeoJSON = async (url, setFunction) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setFunction(data);
      } catch (error) {
        console.error('Error fetching GeoJSON data from Repo:', error);
      }
    };
    fetchGeoJSON('https://raw.githubusercontent.com/mysidewalk/interview/master/frontend-engineer/kc-neighborhoods.json', setKcNeighborhoods);
    fetchGeoJSON('https://raw.githubusercontent.com/mysidewalk/interview/master/frontend-engineer/kc-tracts.json', setKcTracts);
  }, []);

  // Use serialIds for node tests so snapshots match exactly
  let testFlag = false;
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    testFlag = true;
  }
  Highcharts.useSerialIds(testFlag);

  const onMapClick = (event) => {
    if(event.features) {
      setSelectedFeatures(event.features)
    }
  }

  return (
    <Fragment>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    <Map
      // Inital react map code from react-map-gl getting started guide
      // https://visgl.github.io/react-map-gl/docs/get-started
      // longitude and latitude of Kansas City
      initialViewState={{
        latitude: 39.09,
        longitude: -94.57,
        zoom: 10
      }}
      id='KCMap'
      interactiveLayerIds={['neighborhoods','tracts'] }
      style={{width: '100%', height: 500}}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={onMapClick}
    >
      <Source type="geojson" data={kcNeighborhoods}>
        <Layer
          id="neighborhoods"
          type="fill"
          paint={{
            'fill-color': [
            'case',
            // I used chatGPT to structure this case syntax correctly
            // Code is used to change shading/opacity of region when selected
            ['in', ['get', 'id'], ['literal', selectedFeatures.map(f => f.properties.id)]],
            '#000000', // black when selected
            '#808080' // gray when not selected
          ],
            'fill-opacity': [
              'case',
              ['in', ['get', 'id'], ['literal', selectedFeatures.map(f => f.properties.id)]],
              .7,
              .5
            ],
          }}
        />
      </Source>
      <Source type="geojson" data={kcTracts}>
        <Layer
          id="tracts"
          type="fill"
          paint={{
            'fill-color': [
              'case',
              ['in', ['get', 'id'], ['literal', selectedFeatures.map(f => f.properties.id)]],
              '#FF0000', // red when selected
              '#800000' // maroon when unselected
            ],
            'fill-opacity': [
              'case',
              ['in', ['get', 'id'], ['literal', selectedFeatures.map(f => f.properties.id)]],
              .7,
              .5
            ],
          }}
        />
      </Source>
    </Map>
    </Fragment>
  );
}

export default App;
