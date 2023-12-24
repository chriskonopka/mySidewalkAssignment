import { render, screen } from '@testing-library/react';
import App, {createNameLabel, createChartOptions} from './App';

// react-map-gl only works in a browser, needs to be mocked for the tests to run
jest.mock('react-map-gl', () => {
  const Map = jest.fn(({ children }) => <div>{children}</div>);
  const Source = jest.fn(({ children }) => <div>{children}</div>);
  const Layer = jest.fn(({ children }) => <div>{children}</div>);

  return {
    __esModule: true,
    default: Map,
    Source,
    Layer,
  };
});

jest.mock('highcharts/modules/accessibility', () => {
  return jest.fn();
});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));

describe('Render', () => {
  it('renders the Chart Title', () => {
    render(<App />);
    const elements = screen.queryAllByText('Commuter Populations in Selected Regions')
    expect(elements[0]).toBeInTheDocument();
  
  });
  it('Matches DOM Snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
 });

describe('createNameLabel', () => {
  it('returns the correct label for a neighborhood shid', () => {
    const shid = 'country:us/state:mo/place:kansas_city/neighborhood:blue_vue_hills';
    const result = createNameLabel(shid);
    expect(result).toBe('Neighborhood: blue vue hills');
  });

  it('returns the correct label for a tract shid', () => {
    const shid = 'country:us/tract:29095012904';
    const result = createNameLabel(shid);
    expect(result).toBe('Tract: 29095012904');
  });

  it('returns an empty string for an unknown shid type', () => {
    const shid = 'country:us/state:mo/something:unknown';
    const result = createNameLabel(shid);
    expect(result).toBe('');
  });
});

describe('createChartOptions', () => {
  it('returns the correct chart options with two selected features', () => {
    const selectedFeatures = [
      {
          "type": "Feature",
          "state": {},
          "properties": {
              "id": 599128,
              "shid": "country:us/tract:29095015400",
              "area": 1766792,
              "pop-commute-drive_alone": 353,
              "pop-commute-drive_carpool": 43,
              "pop-commute-public_transit": 185,
              "pop-commute-walk": 48
          },
          "source": "jsx-source-3"
      },
      {
          "type": "Feature",
          "state": {},
          "properties": {
              "id": 935683,
              "shid": "country:us/state:mo/place:kansas_city/neighborhood:independence_plaza",
              "area": 1112740,
              "pop-commute-drive_alone": 483.2832189593,
              "pop-commute-drive_carpool": 117.361623342168,
              "pop-commute-public_transit": 109.537687136103,
              "pop-commute-walk": 45.3862513130519
          },
          "source": "jsx-source-1"
      }
    ]
    const expected = {
      "chart": {
        "accessibility": {
          "description": "Bar chart displaying commuter populations in selected regions, broken down by type of commute"
        }, 
        "height": "300px",
        "type": "bar"
      }, 
      "series": [
          {
            "color": "#800000",
            "data":[
              353,
              43,
              185,
              48,
            ],
            "name": "Tract: 29095015400",
          },
          {
            "color": "#808080",
            "data": [
              483.2832189593,
              117.361623342168,
              109.537687136103,
              45.3862513130519,
            ],
            "name": "Neighborhood: independence plaza",
          },
        ],
      "title": {
        "text": "Commuter Populations in Selected Regions"
      },
      "xAxis": {
        "categories": ["drive_alone", "drive_carpool", "public_transit", "walk"], 
        "title": {
          "text": "Commute type"
        }
      },
      "yAxis": {
        "title": {
          "text": "Number of Commuters"
        }
      }
    }
    const result = createChartOptions(selectedFeatures)
    expect(result).toEqual(expected);
  });

  it('returns the correct chart options with one selected feature', () => {
    const selectedFeatures = [
      {
          "type": "Feature",
          "state": {},
          "properties": {
              "id": 599128,
              "shid": "country:us/tract:29095015400",
              "area": 1766792,
              "pop-commute-drive_alone": 353,
              "pop-commute-drive_carpool": 43,
              "pop-commute-public_transit": 185,
              "pop-commute-walk": 48
          },
          "source": "jsx-source-3"
      },
      {
          "type": "Feature",
          "state": {},
          "properties": {
              "id": 935683,
              "shid": "country:us/state:mo/place:kansas_city/neighborhood:independence_plaza",
              "area": 1112740,
              "pop-commute-drive_alone": 483.2832189593,
              "pop-commute-drive_carpool": 117.361623342168,
              "pop-commute-public_transit": 109.537687136103,
              "pop-commute-walk": 45.3862513130519
          },
          "source": "jsx-source-1"
      }
    ]
    const expected = {
      "chart": {
        "accessibility": {
          "description": "Bar chart displaying commuter populations in selected regions, broken down by type of commute"
        }, 
        "height": "300px",
        "type": "bar"
      }, 
      "series": [
        {
          "color": "#800000",
          "data": [
            353,
            43,
            185,
            48,
          ],
          "name": "Tract: 29095015400",
        },
        {
          "color": "#808080",
          "data": [
            483.2832189593,
            117.361623342168,
            109.537687136103,
            45.3862513130519,
          ],
          "name": "Neighborhood: independence plaza",
        },
      ],
      "title": {
        "text": "Commuter Populations in Selected Regions"
      },
      "xAxis": {
        "categories": ["drive_alone", "drive_carpool", "public_transit", "walk"], 
        "title": {
          "text": "Commute type"
        }
      },
      "yAxis": {
        "title": {
          "text": "Number of Commuters"
        }
      }
    }
    const result = createChartOptions(selectedFeatures)
    expect(result).toEqual(expected);
  });

  it('returns the correct chart options with no selected features', () => {
    const selectedFeatures = []
    const expected = {
      "chart": {
        "accessibility": {
          "description": "Bar chart displaying commuter populations in selected regions, broken down by type of commute"
        }, 
        "height": "300px",
        "type": "bar"
      }, 
      "series": [], 
      "title": {
        "text": "Commuter Populations in Selected Regions"
      },
      "xAxis": {
        "categories": ["drive_alone", "drive_carpool", "public_transit", "walk"], 
        "title": {
          "text": "Commute type"
        }
      },
      "yAxis": {
        "title": {
          "text": "Number of Commuters"
        }
      }
    }
    const result = createChartOptions(selectedFeatures)
    expect(result).toEqual(expected);
  });
});