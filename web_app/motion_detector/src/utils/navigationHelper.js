import { useNavigate } from 'react-router-dom';

/**
 * Hook to provide navigation functions
 * @returns {Object} Navigation functions
 */
export function useNavigation() {
  const navigate = useNavigate();

  /**
   * Navigate to a route
   * @param {string} route - Route to navigate to
   */
  const navigateTo = (route) => {
    navigate(route);
  };

  /**
   * Navigate to a route and replace the current entry in the history stack
   * @param {string} route - Route to navigate to
   */
  const navigateReplace = (route) => {
    navigate(route, { replace: true });
  };

  return {
    navigateTo,
    navigateReplace,
  };
}
