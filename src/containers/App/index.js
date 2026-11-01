import React from 'react';
import { renderRoutes } from '../../routes';
import '../../assets/css/main.css';

const App = ({ route }) => <>{renderRoutes(route.routes)}</>;

export default App;
