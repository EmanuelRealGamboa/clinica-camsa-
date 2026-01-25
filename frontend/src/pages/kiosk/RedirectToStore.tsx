import { Navigate, useParams } from 'react-router-dom';

export const RedirectToStore: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  return <Navigate to={`/kiosk/${deviceId}/store`} replace />;
};
