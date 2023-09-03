import { AppRoutes } from './Routes';
import { Auth } from './contexts/Auth';

function App() {
  return (
    <Auth>
      <AppRoutes />
    </Auth>
  );
}

export default App;
