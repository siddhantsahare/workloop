import { Grid } from 'semantic-ui-react'
import './App.css'
import ColorPanel from './components/ColorPanel/ColorPanel';
import SidePanel from './components/SidePanel/SidePanel';
import Messages from './components/Messages/Messages';
import MetaPanel from './components/MetaPanel/MetaPanel';
import { useSelector } from 'react-redux';

function App() {

  const secondaryColor = useSelector(state => state.colors.secondaryColor)
  return (
    <Grid columns="equal" className='app' style={{background: secondaryColor}}>
      <ColorPanel />
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
