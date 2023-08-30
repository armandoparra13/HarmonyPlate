import { AppRoutes } from './Routes';
import { Auth } from './Auth';

function App() {
  return (
    <Auth>
      <AppRoutes />
    </Auth>
  );
}

export default App;

