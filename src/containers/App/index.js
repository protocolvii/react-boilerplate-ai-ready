import React from 'react';
import { renderRoutes } from '../../routes';

const App = ({ route }) => <>{renderRoutes(route.routes)}</>;

export default App;
