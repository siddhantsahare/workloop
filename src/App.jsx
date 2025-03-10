import { Grid } from 'semantic-ui-react'
import './App.css'
import ColorGrid from './components/ColorGrid/ColorGrid';
import SidePanel from './components/SidePanel/SidePanel';
import Messages from './components/Messages/Messages';
import MetaPanel from './components/MetaPanel/MetaPanel';

function App() {

  return (
    <Grid columns="equal" className='app' style={{background: '#eee'}}>
      <ColorGrid />
      <SidePanel />
      <Grid.Column style={{marginLeft: 320}}>
        <Messages />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  )
}

export default App;
