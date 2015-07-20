import {Velocity} from './velocity'

export class App {
  render(){
    return <Velocity>{
      (velocity, move) => <div style={{width:200, height:200}} onMouseMove={move}>
        speed is {Math.round(velocity)}
      </div>
    }</Velocity>
  }
}
