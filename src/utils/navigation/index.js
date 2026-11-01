let navigate;

export const setNavigate = nextNavigate => {
  navigate = nextNavigate;
};

export const navigateTo = (to, options = {}) => {
  if (navigate) {
    navigate(to, options);
    return;
  }

  if (options.replace) {
    window.location.replace(to);
    return;
  }

  window.location.assign(to);
};

export const navigateReplace = to => navigateTo(to, { replace: true });
