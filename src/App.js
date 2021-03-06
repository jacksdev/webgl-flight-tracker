import React from 'react';
import './App.css';

import DeckGL, {IconLayer} from 'deck.gl';

import {StaticMap} from 'react-map-gl';

import { css } from "@emotion/core";
import DotLoader from "react-spinners/DotLoader";

import Airports from 'airports';

import PlaneIcon from './images/plane.png';
import arIcon from './images/ar.png';
// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamZyb2xvdiIsImEiOiJja2toaTIxOGYwMjl1MnVtbjQxcG94OG8xIn0.kI_ZUnQzjhvaOATGXkahMQ';



// Initial viewport settings
let initialViewState = {
  altitude: 1.5,
  bearing: 23.484374999999996,
  longitude: -100.0143893527711,
  latitude: 36.96157896529295,
  zoom: 3.903882166166096,
  pitch: 57.30605204596854
};


// Data to be used by the LineLayer



class App extends React.Component {

  state = {
    loading:true,
    planes: [],
    airports:[],
    hoveredPlane:{
      ico: ''
    },
    hoveredAirport:{
      name: '',
      lat:'',
      long:''
    }
  }

  


  componentDidMount(){

    this.setAirports()
    this.fetchFlightData()
  }



  setAirports = () => {


    const cleanedAirprts = Airports.filter(a => a.type === 'airport');
  
    return this.setState({
      airports: cleanedAirprts.map(d => ({
        name: d.name,
        iata: d.iata,
        iso: d.iso,
        long: Number(d.lon),
        lat: Number(d.lat)
      }))
    })

  }


  fetchFlightData = () => {

    let app = this;

    fetch('https://opensky-network.org/api/states/all')
    .then(res => res.json())
    .then(function(myJson) {      

      let data = myJson.states;

      return app.setState({
        loading: false,
        planes: data.map(d => ({
          ico24: d[0],
          callsign: d[1],
          long: d[5],
          lat: d[6],
          velocity: d[9],
          alt: d[13],
          orgin: d[16],
          true_track: d[10]
        }))
      })
    });
    setTimeout(this.fetchFlightData, 10 * 1000)
  }
  

  render(cleanedAirprts) {

    const layers = [
      new IconLayer({
        id: 'icon_airport',
        data: this.state.airports,
        pickable: true,
        iconAtlas: arIcon,
        iconMapping: {
          marker: {x: 0, y: 0, width: 200, height: 200, mask: false}
        },
        getIcon: d => "marker",
        sizeScale: 5,
        opacity: 0.9,
        getPosition: d => [d.long, d.lat],
        onHover: (d) => {

          if(d.object){
            console.log(d.object.name)
          }
      
          
        
          // if(d){
  
          //   this.setState((state) => {
          //     // Important: read `state` instead of `this.state` when updating.
          //     return {hoveredAirport:{
          //       name: d.iata,
          //       lat: d.lat,
          //       long: d.long
          //     }}
          //   });
          // }
        
        }
      }),
      new IconLayer({
      id: 'planes',
      data: this.state.planes,
      pickable: true,
      iconAtlas: PlaneIcon,
      iconMapping: {
        marker: {x: 0, y: 0, width: 532, height: 532, mask: false}
      },
      getIcon: d => "marker",
      sizeScale: 25,
      opacity: 1,
      getPosition: d => [d.long, d.lat],
      getAngle: d => 65 + (d.true_track * 180) / Math.PI,
      onHover: (d) => {
      
        if(d.object){

          this.setState((state) => {
            // Important: read `state` instead of `this.state` when updating.
            return {hoveredPlane:{
              ico: d.object.ico24,
              callsign: d.object.callsign,
              velocity: d.object.velocity,
              alt: d.object.alt
            }}
          });
        }
      
      }
    })
   
  ]


  const divStyle = {
    margin:'25px',
    position:'absolute',
    display:'block',
    padding:'30px',
    background:'#eee',
    fontFamily:'Lato',
    fontSize:'20px',
    boxShadow: '2px 5px 33px rgba(104, 145, 163, 0.3)',
    lineHeight:'32px'
  }

  const loadScreenCss = {
    margin:'0',
    background:'#eeeeee',
    width:'100%',
    height:'100%',
    position: 'absolute',
  };

  const loadModalCss = {
    padding: '50px',
    width: '250px',
    textAlign: 'center',
    top:'150px',
    margin: '0 auto',
    position:'relative',
    fontFamily:'Lato',
    fontSize:'20px',
    fontWeight:'400',
    color: '#737171'
  }

  const infoCss = {
    fontSize:'20px',
    color: '#0c7997',
    fontWeight:'bold'
  }

  const override = css`
    display: block;
    top: 20px;
    margin: 0 auto;
    color: #01a7f9;
  `;


  function Welcome(props) {
    return <div style={divStyle}>

      Plane: <span style={infoCss}>{props.plane.callsign}</span> <br />
      Altitude: <span style={infoCss}>{props.plane.alt} feet</span> <br />
      Velocity: <span style={infoCss}>{props.plane.velocity} knots</span><br />

      </div>;
  }

  function LoadScreen(props) {
    return <div style={loadScreenCss}>
      
            <div style={loadModalCss}>
              Loading flight data
              
              <DotLoader color='#0c7997' css={override} size={50} />

            </div>
            

          </div>;
  }

    if(this.state.loading){
      return <LoadScreen />
    }
    else {
      return (
        <>
        

        <DeckGL
          initialViewState={initialViewState}
          controller={true}
          layers={layers}
        >

          <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} 
           />

          <Welcome plane={this.state.hoveredPlane} />  
  
          
        </DeckGL>
        </>
      );
    }
      

    
  }
}


export default App;