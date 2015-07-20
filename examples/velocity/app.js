import {Velocity} from './velocity'

// a complete yakshave

// redux provides a way to represent actions/reducers on a value
// disto exposes that as a component
// react-springs smoothes out movements to give average velocity
// all resulting in -

export class App {
  render(){
    return <Velocity>{
      (velocity, move) => <div style={{width:200, height:200}} onMouseMove={move}>
        speed is {Math.round(velocity)}
      </div>
    }</Velocity>
  }
}
