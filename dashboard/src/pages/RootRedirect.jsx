import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Extension and legacy links may hit `/` with query params.
 * Otherwise sends users to the marketing home at `/home`.
 */
export default function RootRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasExtensionPayload = params.get('videoId') || params.get('v') || params.get('token');
    if (hasExtensionPayload) {
      navigate(`/dashboard${location.search}`, { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  }, [location.search, navigate]);

  return null;
}
