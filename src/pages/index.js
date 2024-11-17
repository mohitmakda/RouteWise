import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import styles from '@styles/Home.module.scss';
import dynamic from 'next/dynamic';

const DEFAULT_CENTER = [21.1904, 81.2849];

const Map = dynamic(() => import('@components/Map'), { ssr: false });

export default function Home() {
  const [markers, setMarkers] = useState([
    { id: 'default', position: DEFAULT_CENTER },
  ]);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        setL(leaflet);
      });
    }
  }, []);

  const addMarker = (location) => {
    const newId = `marker-${Date.now()}`;
    setMarkers((prevMarkers) => [
      ...prevMarkers,
      { id: newId, position: location },
    ]);
  };

  const removeMarker = (id) => {
    setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== id));
  };

  const sortedMarkers = useMemo(() => {
    if (!L) return markers;

    return markers
      .map((marker) => {
        if (Array.isArray(marker.position) && marker.position.length === 2) {
          const latLng = new L.LatLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
          const markerLatLng = new L.LatLng(marker.position[0], marker.position[1]);
          return {
            ...marker,
            distance: latLng.distanceTo(markerLatLng),
          };
        } else {
          return null;
        }
      })
      .filter((marker) => marker !== null)
      .sort((a, b) => a.distance - b.distance);
  }, [markers, L]);

  if (!isClient || !L) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Routewise</title>
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>Routewise</h1>

          <Map
            className={styles.homeMap}
            width="800"
            height="400"
            center={DEFAULT_CENTER}
            zoom={12}
          >
            {({ TileLayer, Marker, Popup, Polyline, Tooltip, useMapEvent }) => {
              const MapClickHandler = () => {
                useMapEvent('click', (e) => {
                  addMarker([e.latlng.lat, e.latlng.lng]);
                });
                return null;
              };

              const pathCoordinates = sortedMarkers.map((marker) => marker.position);

              return (
                <>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                  />
                  <Polyline positions={pathCoordinates} color="blue" />

                  {sortedMarkers.map((data, index) => (
                    <Marker key={data.id} position={data.position}>
                      <Popup>
                        <div>
                          <p>
                            Latitude: {data.position[0]}, Longitude: {data.position[1]}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMarker(data.id);
                            }}
                            style={{
                              cursor: 'pointer',
                              padding: '5px 10px',
                              background: '#f44336',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              marginTop: '5px',
                            }}
                          >
                            Remove Marker
                          </button>
                        </div>
                      </Popup>
                      <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                        {index + 1}
                      </Tooltip>
                    </Marker>
                  ))}
                  <MapClickHandler />
                </>
              );
            }}
          </Map>
        </Container>
      </Section>
    </Layout>
  );
}
